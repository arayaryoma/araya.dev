---
title: Node.jsでのrecursive readdir
tags:
    - Node.js
    - JavaScript
---
## やりたいこと

下記のディレクトリで、`files`以下に存在するファイルのパスをすべて取得したい。
```bash
.
└── files
    ├─ a
    │   ├─ a.txt
    │   └─ aa
    │       └─ aaa
    │           └─ a-aa-aaa.txt
    ├─ b
    │   └─ bb
    │       └─ b-bb.txt
    └─ c
        ├─ c.txt
        ├─ c1
        │  └─ c-c1.txt
        └─ c2
            └─ c-c2.txt
```
つまりこのような結果が得られればいい。
```javascript
[
  './files/a/a.txt',
  './files/a/aa/aaa/a-aa-aaa.txt',
  './files/b/bb/b-bb.txt',
  './files/c/c.txt',
  './files/c/c1/c-c1.txt',
  './files/c/c2/c-c2.txt'
]
```
これをNode.jsで実現することを考える。

## Node.jsのfs.readdir
Node.jsでファイルシステムを扱うためのパッケージ`fs`に、`readdir`関数があり、これでディレクトリ内のファイルを取得できる。
これが再帰的にディレクトリを探索してくれないかドキュメントを見てみる。

[https://nodejs.org/dist/latest-v10.x/docs/api/fs.html#fs_fs_readdir_path_options_callback](https://nodejs.org/dist/latest-v10.x/docs/api/fs.html#fs_fs_readdir_path_options_callback)

どうやら`{recursive: true}`や`{depth: 100}`のようなオプションを渡すことはできないようだ。

## Googleで解決策を調べる
Googleで「node.js recursive readdir」などと調べると、以下のようなページやパッケージが見つかる
- [https://github.com/jergason/recursive-readdir](https://github.com/jergason/recursive-readdir)
- [https://stackoverflow.com/questions/5827612/node-js-fs-readdir-recursive-directory-search](https://stackoverflow.com/questions/5827612/node-js-fs-readdir-recursive-directory-search)
- [https://gist.github.com/kethinov/6658166](https://gist.github.com/kethinov/6658166)

これらの実装例は

1. `fs.readdir`でディレクトリ直下のファイルのリストを取得する
2.  1の結果をループやイテレータで回し、各ファイルのパスを`fs.stat`関数に渡し、`fs.Stats`オブジェクトを得る
3.  `fs.Stats`オブジェクトには`isDirectory()`メソッドがあり、これで対象のファイルがディレクトリかどうか判定する
4-a. 3の結果、ディレクトリだった場合はそのディレクトリについて、1~3を行う
4-b. 3の結果、ファイルだった場合は配列`files`に格納し、2の次のループに行く
5. ループが終わったら配列`files`を返す

という処理を実装している。最小限の実装例を書くと下記のようになる。
なお、ここでは処理の流れを置いやすいように同期実行される関数(`fs.readdirSync`, `fs.statSync`)を用いている。

```javascript
const fs = require("fs");

const readdirRecursively = (dir, files = []) => {
  const paths = fs.readdirSync(dir);
  const dirs = [];
  for (const path of paths) {
    const stats = fs.statSync(`${dir}/${path}`);
    if (stats.isDirectory()) {
      dirs.push(`${dir}/${path}`);
    } else {
      files.push(`${dir}/${path}`);
    }
  }
  for (const d of dirs) {
    files = readdirRecursively(d, files);
  }
  return files;
};

console.log(readdirRecursively("./files"));
// =>
// [
//   './files/a/a.txt',
//   './files/a/aa/aaa/a-aa-aaa.txt',
//   './files/b/bb/b-bb.txt',
//   './files/c/c.txt',
//   './files/c/c1/c-c1.txt',
//   './files/c/c2/c-c2.txt'
// ]
```

やりたかったことが実現できているのがわかる。

## Node.js v10.10以降での実装
実はNode.js v10.10以降では、`fs.stat`を持ちいらずとも、`fs.readdir`だけでこの要件が解決できる方法が用意されている。
`fs.readdir`、`fs.readdirSyn`にオプションとして`{withFileTypes: boolean}`というパラメーターを渡せるようになった。([該当PR](https://github.com/nodejs/node/pull/22020))

これを利用し`fs.readdir('filepath', {withFileTypes: true}, (err, files))`とすると、`files`引数には`fs.Dirent`オブジェクトの配列(`fs.Dirent[]`)が渡される。

`fs.Dirent`オブジェクト`dirent`は以下のようなプロパティを持つ([公式ドキュメントより](https://nodejs.org/dist/latest-v10.x/docs/api/fs.html#fs_class_fs_dirent))
- `dirent.isBlockDevice()`
- `dirent.isCharacterDevice()`
- `dirent.isDirectory()`
- `dirent.isFIFO()`
- `dirent.isFile()`
- `dirent.isSocket()`
- `dirent.isSymbolicLink()`
- `dirent.name`

`dirent.isDirectory()`は、`fs.Stats.isDirectory`と同じくディレクトリだった場合に`true`を返してくれるので、先述の実装をこれを用いて置き換えることができる。

```javascript
const fs = require("fs");

const readdirRecursively = (dir, files = []) => {
  const dirents = fs.readdirSync(dir, { withFileTypes: true });
  const dirs = [];
  for (const dirent of dirents) {
    if (dirent.isDirectory()) dirs.push(`${dir}/${dirent.name}`);
    if (dirent.isFile()) files.push(`${dir}/${dirent.name}`);
  }
  for (const d of dirs) {
    files = readdirRecursively(d, files);
  }
  return files;
};

console.log(readdirRecursively("./files"));
```

これにより、`fs.stat()`によるファイルシステムコールを減らすことができる。

## 非同期関数を用いる
先述の例では同期関数である`fs.readdirSync`を使っていたが、Node.jsには非同期関数が用意されているためそれを用いたい。

また、Node.js v10ではexperimental featureとして、`fs.promises`APIが[提供されている](https://nodejs.org/dist/latest-v10.x/docs/api/fs.html#fs_fs_promises_api)。
`fs.readdir`では、結果を受け取るコールバック関数を第2引数に渡していたが、`fs.promises.readdir`は結果をPromiseで返してくれるため、下記のように書くことができる。
```javascript
const fs = require("fs");
const fsPromises = fs.promises;
const options = {
  // options
};
fsPromises.readdir('path', options).then(files => {
  // Do something
}).catch(err => {
  // Handle the error
});
```
これを用いて、非同期なrecursive readdirを実装すると

```javascript
const fs = require("fs");
const fsPromises = fs.promises;

const readdirRecursively = async (dir, files = []) => {
  const dirents = await fsPromises.readdir(dir, { withFileTypes: true });
  const dirs = [];
  for (const dirent of dirents) {
    if (dirent.isDirectory()) dirs.push(`${dir}/${dirent.name}`);
    if (dirent.isFile()) files.push(`${dir}/${dirent.name}`);
  }
  for (const d of dirs) {
    files = await readdirRecursively(d, files);
  }
  return Promise.resolve(files);
};

(async () => {
  const result = await readdirRecursively("./files").catch(err => {
    console.error("Error:", err);
  });
  console.log(result);
})();
```

このような実装例になる。

また、v10ではfs.Promises APIはexperimentalとなっているため、これを実行すると警告が出るが、この記事執筆時点でCurrent versionである[v12ではstableとなっている。](https://nodejs.org/dist/latest-v12.x/docs/api/fs.html#fs_fs_promises_api)

## おまけ direntという概念
Linuxプログラミングにおいて、`readdir`関数は`dirent`構造体を返す。
[manページ](http://man7.org/linux/man-pages/man3/readdir.3.html)によると、この`dirent`構造体は

```c
struct dirent {
     ino_t          d_ino;       /* Inode number */
     off_t          d_off;       /* Not an offset; see below */
     unsigned short d_reclen;    /* Length of this record */
     unsigned char  d_type;      /* Type of file; not supported
                                    by all filesystem types */
     char           d_name[256]; /* Null-terminated filename */
};
```

と定義されていて、`d_type`から、`DT_DIR`や`DT_REG`などファイルタイプを取得することができる。Node.jsの`fs.Dirent`オブジェクトもこれを踏襲していると思われる。
