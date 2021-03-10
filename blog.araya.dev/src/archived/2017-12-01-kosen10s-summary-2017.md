---
title: "2017年にあったKosen10'sの動きまとめ"
date: "2017-12-01 00:00:00 +0900"
---

この記事は[#kosen10s Advent Calendar 2017](https://adventar.org/calendars/2199)
の1日目の記事です。

2017年も残すところあと1ヶ月となったので、僕は2017年にKosen10'sであった動きを振り返りたいと思います。

## Kosen10'sとは
初日なので一応書いておきます。<br>
Kosen10'sとはなにかというと、2010年4月に高専本科に入学した人たちで遊んでいるグループです。
[connpassのイベントページ](https://kosen10s.connpass.com/event/69541/)に掲載
されている言葉を借りると、

> 2010年に選択を間違えた人たちでワイワイする

ということだそうです。

具体的に何をやっているかというと、
Slackで与太話をしたり、
たまにLT大会をやったり、ダーツやビリヤード、麻雀などをして遊んだり飲み会をしたりしています。

Kosen10'sの団体名について、
`Kosen10's`とか`kosen10's`とか`KOSEN10's`とか`kosen10s`とかとか色々表記ゆれがありますが、
なんでも良いので気にしなくて大丈夫です。

読み方は「こーせんてんず」です。 縮めて、「てんず」とか言ったりします。

## What's new in 2017
前置きの紹介も一通り終わったので、アドベントカレンダー1日目の本題に移ろうと思います。

2017年1月から2017年11月にKosen'10sであった新しい動きやイベントを、以下の項目について振り返ろうと思います。
- イベント
- Slack channel
- emoji

### イベント
[connpassのイベント一覧](https://kosen10s.connpass.com/)からスクショを撮ってきました。

![]({{site.url}}/images/2017-11-28-kosen10s-summary-2017/s.png){:class="full-size-image"}

LT、花見、ダーツ・ビリヤード、バドミントン、3周年パーティと結構色々やっています。
この他にもConnpassは立ててないけど集まって遊んだりしているので、月一以上のペースで何かしら活動が行われていると思います。

### Slack channel
[Slack API](https://api.slack.com)を駆使して、2017年内に作られたSlack channelを見てみます。

Slackの`channels.list`と`users.profile.get`を駆使して、2017年に作られたchannelと作者をリストにしたものがこちらです。

```
Channel Name: #___
Created by: allajah
Created at: 2017/3/17
Purpose:
Topic:

Channel Name: #3rd-anniversary
Created by: denari
Created at: 2017/9/23
Purpose: kosen10s(さんさい)
Topic: <http://kosen10s.net/3rd-anniversary/|kosen10s.net/3rd-anniversary/>

Channel Name: #badminton
Created by: denari
Created at: 2017/5/29
Purpose: する。一時的なchannelのつもりだけど、運動系全体channelにして長期運用もアリ
Topic: <https://kosen10s.connpass.com/event/69887/>

Channel Name: #board-game
Created by: tsudukami
Created at: 2017/6/28
Purpose: 非電源ゲームを楽しむ
Topic:

Channel Name: #datz-botch
Created by: denari
Created at: 2017/3/24
Purpose: ふとした時に 「ぼっち」 を回避するため、各位に「今日飯イケる人〜」みたいなのを聞くchannel(試験運用)
Topic:

Channel Name: #dtm部
Created by: unasuke
Created at: 2017/8/8
Purpose: 部活
Topic:

Channel Name: #freelance
Created by: c-bata
Created at: 2017/9/30
Purpose:
Topic:

Channel Name: #game
Created by: allajah
Created at: 2017/7/20
Purpose:
Topic:

Channel Name: #gender
Created by: tsudukami
Created at: 2017/2/21
Purpose:
Topic:

Channel Name: #golang
Created by: allajah
Created at: 2017/1/2
Purpose: We love go-gopher &lt;3
Topic: :golang:

Channel Name: #heya
Created by:
Created at: 2017/1/7
Purpose: 部屋
Topic:

Channel Name: #kusa
Created by: puhitaku
Created at: 2017/6/28
Purpose: :kusa: 生やしたらこちらへ流しましょう。
Topic: :kusa:

Channel Name: #lt08
Created by: denari
Created at: 2017/6/5
Purpose: 7月
Topic: https://kosen10s.connpass.com/event/62398/

Channel Name: #lt09
Created by: sakasin
Created at: 2017/7/31
Purpose:
Topic: 日程調整

Channel Name: #lt10
Created by: allajah
Created at: 2017/10/12
Purpose: 3周年記念 :tada:
Topic:

Channel Name: #pool
Created by: zero
Created at: 2017/1/27
Purpose:
Topic: :zero_: pool is a place that people play billiards.

Channel Name: #うどん
Created by: denari
Created at: 2017/4/17
Purpose: 思い立ったが吉日。うどん県でうどん食う。時期すら未定
Topic: 時期を決めるだけの決定材料を探そう！

Channel Name: #おしゃれスポーツ
Created by: denari
Created at: 2017/3/20
Purpose: :darts: :eight_ball:
Topic: おしゃれスポーツダサい問題

Channel Name: #お花見
Created by: denari
Created at: 2017/3/22
Purpose: OHANAMI
Topic: 4/9開催 任意のN次会について飯田橋駅にて集合

Channel Name: #ジャパリパーク
Created by: allajah
Created at: 2017/3/17
Purpose: Welcome to ようこそ ジャパリパーク！
Topic:

Channel Name: #てすと
Created by:
Created at: 2017/3/17
Purpose:
Topic:

Channel Name: #どうぶつの森ポケットキャンプ
Created by: denari
Created at: 2017/11/25
Purpose: 使い道ないけどともかく作った。IDを置いておく場所になりそう
Topic:

Channel Name: #秋吉会
Created by: unasuke
Created at: 2017/7/16
Purpose: 秋吉に行く
Topic:

Channel Name: #麻雀
Created by: allajah
Created at: 2017/10/9
Purpose: :mahjong:  初心者・これから始めたい人歓迎
Topic:
```

実に24ものchannelが2017年中に作られていることがわかりますね。
作成者はdenariが多いみたいです。

今年の3月頃に日本語名のChannelが作成できるようになったので、いくつか日本語名のChannelもあります。<br>
今生き残ってるもので最初に作られたのは`#ジャパリパーク`channelです。

僕が3/17に`#___`なるChannelを作ってるみたいですが、全く記憶にありません。

また、この記事を書いた直後に自らの手で`#job`channelを追加したので、2017年に作られたchannelは25になりました。

### emoji
Kosen10sのSlackといえばemojiの数が尋常ではないと内輪でよく話題になります。

![]({{site.url}}/images/2017-11-28-kosen10s-summary-2017/e.png){:class="full-size-image"}

aliasも含めると750あるみたいです。

試したら、残念ながら Slack APIではemojiの作成日が取得できなかったため、2017年に追加されたemojiをリスト化することはできませんでした。
(おそらく、`#emoji` channelのログを漁れば分かると思うので誰かやってくれるかも...)

emoji関連で大きな動きといえば、最近日本語でもemojiが登録できるようになったので、こんなことになっています。

![]({{site.url}}/images/2017-11-28-kosen10s-summary-2017/e2.png){:class="full-size-image"}

ぽのか先輩の別称がわかって便利ですね。

最近はA~Zのアルファベットを全部企業やサービスのロゴで埋めようという動きもあって、 `#emoji` channelの動向は要チェックです。


ちなみに、こんな話もあります。
<blockquote class="twitter-tweet" data-partner="tweetdeck"><p lang="ja" dir="ltr"><a href="https://twitter.com/hashtag/kosen10s?src=hash&amp;ref_src=twsrc%5Etfw">#kosen10s</a> に麻雀部ができたら牌全種のemojiを追加することを宣言します</p>&mdash; あらや (@_araya_) <a href="https://twitter.com/_araya_/status/917389997686251522?ref_src=twsrc%5Etfw">October 9, 2017</a></blockquote>
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>



## まとめ
こんな雰囲気で、Kosen10'sはゆるく楽しく遊んでいます。
2010年に高専入学していて、僕達と遊んでくれる人がいたらぜひ[Slackに参加](https://kosen10s-invite.herokuapp.com/)してください！

明日は[@puhitaku](https://twitter.com/puhitaku)の記事です。

[#kosen10s Advent Calendar 2017](https://adventar.org/calendars/2199)
は参加者の80%くらいが何を書くのか全くわからないので、当日まで目が離せません :eyes:
