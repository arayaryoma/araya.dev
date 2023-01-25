---
title: "GCP Global Meetupに参加してきた"
date: "2017-06-20 19:42:53 +0900"
tags:
  - イベントレポート
  - Google Cloud Platform
---

株式会社メルカリさんのオフィスで開催された[GCP Global Meetup](https://gcpug-tokyo.connpass.com/event/58494/)に参加してきた。

今回は基調講演(?)に[Amanda さん](https://twitter.com/chibichibibr)のエンジニアのダイバーシティについて、女性エンジニア目線からのトークがあって、
その影響からか参加者層がどう見ても普段自分が行くような勉強会と違って面白かった。

メモとってないので、忘れないうちに覚えてる範囲でレポート書いとく。

## Diversity in technology + English 101 by [@chibichibibr](https://twitter.com/chibichibibr)

Google Developers Group の Amanda さんのセッション。Amanda さんがなんでソフトウェアデベロッパーになったかとか、
コミュニティに参加して色んな人に質問するべきとか、デベロッパースピリッツ的な話があってよかった。
英語で話していたけど綺麗な英語でゆっくり話してくれてたのでめちゃくちゃ聞き取りやすかった。

![]({{site.url}}/images/gcp-global-meetup/img1.JPG)

大学でコンピュータ・サイエンス学んでるときに「残念ながら君には向いてない」て言われたけど、
ある教員に「それは彼が勝手にそう思ってるだけであって君には関係ない」と言われ、努力でどうにでもなると気づいた(意訳、資料が公開されたら見てみてください)

って話はすごい良くて、外からの心理的要因で自分の限界を決めるの絶対やめようと思った。

あと質疑で、「女性は出産とか妊娠とかですぐやめてしまうから、女性エンジニア取るのやめようかなって上司が言ってる」て話があって、結構衝撃だった。
性別だけじゃなく、ダイバーシティを受け入れ、推進していく会社で働きたいし、日本のすべての会社がそうあって欲しい。

## 懇親会

メルカリさんの提供で軽食。豪華〜！！

![]({{site.url}}/images/gcp-global-meetup/img2.JPG)

メルカリさん、こういうミートアップイベントにここまで力入れられるの本当にすごい。美味しかったです 🙏

## API.ai demo by [@tenntenn](https://twitter.com/tenntenn)

tenntenn さんによる API.ai のデモ。 Slack の integration もあるっぽいので、色々と遊べそう。
Amazon Lex と今度比較して使ってみたい。

僕も Google に買われる直前くらいに触ったことあって、その頃は日本語はまだ全然バカだったんだけど、今もそんなに頭良くないらしく、改善中とのこと。
英語はかなり頭いいらしいので、現状使うとしたら英語一択になりそう。

## image recognition at Go and Cloud vision api by [Women who go](https://womenwhogo-tokyo.connpass.com/)

Women who Go の [@akane_256](https://twitter.com/akane_256)さんのセッション。 Google が提供している画像認識 API、 [Cloud Vision API](https://cloud.google.com/vision/)のお話。
Cloud Vision API の主な特徴としては

- GCP 上で提供されている
- REST API に画像認識の機械学習モデルが搭載されている
- 例えば、POST メソッドで画像の URL を渡すと画像を解析した結果が返ってくる
- (人の)感情分析・ランドマークの認識・顔認識などができる

といったところ。Cloud Vision の Web サイトでテストできるので試してみると面白い。ちなみに gif もいけた。
![]({{site.url}}/images/gcp-global-meetup/img5.jpg)
動く Michelle の gif を入れてみた。感情分析された結果がでてるけど、どれも Very Unlikely になってるので、この Michelle は機械的にはすごく難しい表情をしている。

![]({{site.url}}/images/gcp-global-meetup/img6.jpg)
ぽのか先輩は CloudVision 的には馬です 🐴

画像認識 API が手軽に使えるのはいいなと思った。
入力画像が公序良俗に反しないか判別してくれる機能あったらかなり便利かも。

質疑で面白かったのが、

- Q: 顔認識で、有名人の顔が映ってる画像入力したら、この人は ◯◯ ですって返してくれる？
- A: 有名人の認識は、顔認識ではなくランドマーク認識で実現できる。有名な建物なんかと同じ扱い。そのため、スティーブ・ジョブズが写ってる画像を入力すると
  「スティーブ・ジョブズが写ってる」というのは教えてくれるが、それが画像中どこに当たるのかまでは教えてくれない。(この回答は登壇者とは別の方)

とのこと。なんでそういう仕様なんだろう。機械学習・画像認識に詳しい人いたら教えてください。

Cloud Vision API は触って遊んでみたいと思った。楽しそう。

## Google's expert Q&A after google next

Google Developers Experts の方々によるパネルディスカッション。

登壇者の方々がどういう経緯でエンジニアになったかとか、初心者にプログラミングをどう教えるかとか、あんま GCP の話しなかったけど、
前の API.ai セッションの質疑とかほぼパネルディスカッションだったしいいよね って感じの、ゆるいテンションで進行されてて大変良かった。
普段登壇している人にそういう話あんまり聞かないのでおもしろかった。

## まとめ

- GCP、意外と知らないサービスいっぱいあって、結構遊べそう
- インフラ構築しなくても GAE にシュッとデプロイして一瞬で動かせるってのいいよね。BaaS の強み。
- 個人で使ってると一瞬で無料枠使い切りそうなのが悩み
