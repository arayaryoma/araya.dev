---
title: "memo: HTTPで99以下のstatusは500として扱われるべきだがhyperではそれができない"
tags:
  - memo
  - rust
  - http
date: "2025-09-10"
description: "RFC9110では100-599の範囲外のHTTPステータスコードは5xxとして扱うべきとされているが、RustのHTTPライブラリhyperではそれができない理由と背景について"
---

「HTTPで有効なStatus Codeはなにか」

答えはシンプルに「100から599までの整数」になる。もう少し正確に言えば「100から599までの整数で、[IANA registry](https://www.iana.org/assignments/http-status-codes/http-status-codes.xhtml)に登録されているもの」になるだろう。
これについてはRFC9110に記載がある。

https://www.rfc-editor.org/rfc/rfc9110.html#section-15-1

> All valid status codes are within the range of 100 to 599, inclusive.

では以下のようなHTTP/1.1のresponseを受け取ったclientはresponseをどう扱うべきか。

_ResA_

```
HTTP/1.1 F00 NotANumber \r\n
```

_ResB_

```
HTTP/1.1 600 Over599 \r\n
```

_ResC_

```
HTTP/1.1 99 Under100 \r\n
```

_ResA_ の扱いは実装にもよるが、statusのparse自体ができないためnetwork errorとして扱うことが多い。

_ResB_ のような「3桁の整数」ではあるが範囲が600を超えるstatusは、interfaceに露出しない内部処理で扱われることがある。
例えばFastly VCLでは、subroutineの一連の処理の途中で`vcl_error`に大域脱出するために `error 600;` のように一時的に6xxのstatusをセットするtipsがFastlyのdocumentでも紹介されている。

https://www.fastly.com/documentation/reference/vcl/subroutines/error/

> HINT: When triggering errors from other parts of your VCL, we recommend using a status code in the 6xx range. Numbers lower than 600 are reserved by HTTP standards and those above 700 are used by Fastly for internal signaling.

もちろんclientにresponseを返す前に、 `vcl_error` 内で適切な100-599のstatusに書き換える必要がある。

うっかりそれを忘れ `600` のままclientにresponseを送ってしまった場合、それを受け取ったclientはどう扱うべきかについてはRFC9110に記載がある。

https://www.rfc-editor.org/rfc/rfc9110.html#section-15-6

> Values outside the range 100..599 are invalid.
> (中略)
> A client that receives a response with an invalid status code SHOULD process the response as if it had a 5xx (Server Error) status code.

つまり、上記の例でnetwork errorとして扱うべきは _ResA_ のみであり、statusが数値ではあるが100-599の範囲外である _ResB_ , _ResC_ については5xx errorとして扱うべきだ。

## hyper での扱い

[hyper](https://github.com/hyperium/hyper)はRustで最も使われているhttp libraryであり、server/client 向けの薄い実装を提供している。

hyperを使って上述の _ResA_ , _ResB_ , _ResC_ のresponseを返すserverに対してrequestを送ってみる。
サンプル実装: https://github.com/araya-playground/hyper-client/blob/main/src/main.rs

この実装は

```
 "http://web-platform.test:8000/fetch/h1-parsing/resources/status-code.py?input=F00%20NotANumber",
 "http://web-platform.test:8000/fetch/h1-parsing/resources/status-code.py?input=600%20Over599",
 "http://web-platform.test:8000/fetch/h1-parsing/resources/status-code.py?input=99%20Under100",
```

の3つのurlに対してHTTP requestを送り、responseを表示しているだけ。
`http://web-platform.test:8000` は [WPT](https://github.com/web-platform-tests/wpt) をlocalで起動していて、 `status-code.py` は `input` paramで送られてきた値をそのままstatusとreason phraseとしてresponseする。

https://github.com/web-platform-tests/wpt/blob/f554aeda938df2e5aa90f2b81cb2215a2b78f051/fetch/h1-parsing/resources/status-code.py

これを実行した結果は

```
//  ResA
============================================================
Testing URL: http://web-platform.test:8000/fetch/h1-parsing/resources/status-code.py?input=F00%20NotANumber
============================================================
Connecting to: web-platform.test:8000
❌ Error occurred: invalid HTTP status-code parsed
Error details: hyper::Error(Parse(Status))

//  ResB
============================================================
Testing URL: http://web-platform.test:8000/fetch/h1-parsing/resources/status-code.py?input=600%20Over599
============================================================
Connecting to: web-platform.test:8000
✅ Request successful!
Status: 600 <unknown status code>
Headers: {
    "header-parsing": "is sad",
}
Response body:

//  ResC
============================================================
Testing URL: http://web-platform.test:8000/fetch/h1-parsing/resources/status-code.py?input=99%20Under100
============================================================
Connecting to: web-platform.test:8000
❌ Error occurred: invalid HTTP status-code parsed
Error details: hyper::Error(Parse(Status))
```

となる。 _ResC_ (2桁の数値がstatusに指定されている)を受け取ったときにErrorとなっていることがわかる。
注目すべきはこのError種別で、 _ResA_ と _ResC_ が同じ `Status` enumが使われている。
つまり、「status-lineそのものが壊れていてparseできない 」ことと「無効なstatusであること」が区別できない。

ただ、これはhyperを用いるほとんどのアプリケーションにとっては問題にならないだろう。受け取ったstatusが仕様違反であることには変わりないのだから、Errorさえ返ってきてくれればerror logに出力して例外をハンドルすることができる。

しかし、RFC以外にも互換性と歴史的経緯を踏まえた仕様を実装しなければならないbrowserとなると話はややこしくなる。

Fetch の Living Standardの[Statuses](https://fetch.spec.whatwg.org/#statuses)セクションには

> A status is an integer in the range 0 to 999, inclusive.

という記載がある。
つまり、 _ResC_ についてはbrowserはfetchそのものが失敗したのではなく、statusがinvalidだという扱いをしなければいけない。なお、status codeが4桁の場合はparseそのものが失敗すべきだということがここからわかる。

実際Web Platform Tests(WPT)にもこのtest項目があり、これについてはすべてのモダンbrowserがpassしている。
https://wpt.fyi/results/fetch/h1-parsing/status-code.window.html?label=experimental&label=master&aligned

そして hyperをhttp client libraryとして用いているServoはpassできていない。

https://wpt.fyi/results/fetch/h1-parsing/status-code.window.html?product=servo

## この問題を解消する難しさ

hyper自体がHTTP/1.1のmessageをparseしているわけではない。

hyperはmessageのparseを[httparse](https://github.com/seanmonstar/httparse)という別のcrateに依存している。
httparseのstautsのparse実装は下記。

```rust
fn parse_code(bytes: &mut Bytes<'_>) -> Result<u16> {
    let hundreds = expect!(bytes.next() == b'0'..=b'9' => Err(Error::Status));
    let tens = expect!(bytes.next() == b'0'..=b'9' => Err(Error::Status));
    let ones = expect!(bytes.next() == b'0'..=b'9' => Err(Error::Status));

    Ok(Status::Complete((hundreds - b'0') as u16 * 100 +
        (tens - b'0') as u16 * 10 +
        (ones - b'0') as u16))
}
```

https://github.com/seanmonstar/httparse/blob/36147265105338185f49ceac51a9bea83941a1ec/src/lib.rs#L928-L936

先頭から3bytes読み、`0..9`以外が出現したら `Error::Status` を返し、3bytes読み切ったらそれを結合してu16として返している。4桁、例えば `1000` が渡されたときにはこの関数で`100` を返すが、後続の処理で予期せぬtokenが残っているのでやはり `Error::Status` になる。

```rust
match next!(bytes) {
    b' ' => {
        if config.allow_multiple_spaces_in_response_status_delimiters {
            complete!(skip_spaces(&mut bytes));
        }
        bytes.slice();
        self.reason = Some(complete!(parse_reason(&mut bytes)));
    },
    b'\r' => {
        expect!(bytes.next() == b'\n' => Err(Error::Status));
        bytes.slice();
        self.reason = Some("");
    },
    b'\n' => {
        bytes.slice();
        self.reason = Some("");
    }
    _ => return Err(Error::Status),
}
```

https://github.com/seanmonstar/httparse/blob/36147265105338185f49ceac51a9bea83941a1ec/src/lib.rs#L679-L697

ということで、httparseがすでにstatus-line自体がinvalidなこととstatus-codeがinvalidなことを区別していないため、hyperでこれをhandleすることはできない。

httparseには `ParseConfig` というその名のとおりparseのoptionを指定するためのstructが用意されている。

https://github.com/seanmonstar/httparse/blob/36147265105338185f49ceac51a9bea83941a1ec/src/lib.rs#L210-L218

```rust
pub struct ParserConfig {
    allow_spaces_after_header_name_in_responses: bool,
    allow_obsolete_multiline_headers_in_responses: bool,
    allow_multiple_spaces_in_request_line_delimiters: bool,
    allow_multiple_spaces_in_response_status_delimiters: bool,
    allow_space_before_first_header_name: bool,
    ignore_invalid_headers_in_responses: bool,
    ignore_invalid_headers_in_requests: bool,
}
```

httparseはすでにv1がreleaseされているから、 breaking changesをいれるよりはここにflagを追加するのがいいだろう。

ただ、httparseはメンテナンスがあまりアクティブではなくここ半年ほどPRも取り込まれていない。
httparseの作者はhyperium orgのmemberであるため、hyperiumにrepositoryを移してコミュニティベースの管理にするのがいいと思うが、これを外から口出すのは心象も良くないだろうからあまり期待していない。

そもそもhttparseやhyperはbrowserのようなWHATWG fetch standardに従わなきゃいけないようなアプリケーションをスコープに考えていないだろうから、どちらかというとServoがhyper/httparse相当を実装すべきだろうと考えている。
