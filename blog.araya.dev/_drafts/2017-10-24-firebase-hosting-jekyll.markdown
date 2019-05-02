---
title: "Firebase Hostingを使って静的Webサイトを独自ドメインかつSSL証明書付きで公開する"
date: "2017-10-24 14:07:04 +0900"
---

ブログのホスティング先をGitHub PagesからFirebase Hostingに変えてみた。


## Firebase Hostingとは
その名の通りFirebaseがWebサイトをホスティングしてくれるサービス。

[https://firebase.google.com/docs/hosting/](https://firebase.google.com/docs/hosting/)

嬉しいポイントは
> Zero-configuration SSL is built into Firebase Hosting so content is always delivered securely.

ここにあって、なんと独自ドメインでもSSLをサポートしてくれる。

[料金](https://firebase.google.com/pricing/)も、フリーでそこそこ使えて、ホスティングしてくれるファイルの最大容量は計1GB、
月10GBまで配信できる。
個人ブログくらいならフリーで間に合うし、足りなくなっても月$25払えば10GBストア、月50GB配信できるので安くすむ。


## Firebaseでのセットアップ
[FirebaseのConsole](https://console.firebase.google.com/)にログインして新規プロジェクトを作成する。

## セットアップ
Firebase CLIをnpmでインストールする
```
npm install -g firebase-tools
```

## Firebase CLIでログインする
```
firebase login
```
ブラウザが起動して、Googleアカウントでサインインが求められるのでサインインする。

## プロジェクトの設定をする
```
firebase init
```
対話型でまずカレントディレクトリを設定する目的を聞いてくる。
```
Which Firebase CLI features do you want to setup for this folder?
```
ここでは `Hosting` を選択する。

次に、設定するFirebaseのプロジェクトを聞いてくるので、さきほど作成したFirebaseプロジェクトを選択する。
```
Select a default Firebase project for this directory:
```
次に、どのディレクトリをpublic directoryに選択するか聞かれる。
ここに設定したディレクトリがrootとしてFirebaseにデプロイされるので、
Webサイトの場合は`index.html`が格納されている、ビルドしたディレクトリ(`dist`など)を指定する。
jekyllの場合は`_site`が該当するので、それを指定する。

```
 What do you want to use as your public directory?
 ```

 次に、プロジェクトをSingle Page Applicationとして設定するか聞いてくる。
`yes`にするとURLを全て/index.htmlにリダイレクトさせる。
今回の場合は`NO`でいい。
```
Configure as a single-page app (rewrite all urls to /index.html)? (y/N)
```

```
 Firebase initialization complete!
```
ここまで完了すると、`.firebaserc`と`firebase.json`が作成される。
プロジェクトIDや、`firebase init`で設定した項目を変えたい場合は編集する。

## ビルド
jekyllの場合は`_config.yml`の`url`フィールドを変更する必要がある
Firebaseのコンソールにアクセスし、projectIDを確認する。
デプロイ先のURLは`https://{project_id}.firebaseapp.com`になるので、これを`url`フィールドに設定する(`{project_id}`は置き換える)。


## デプロイ
```
firebase deploy
```
デプロイ完了。Firebase ConsoleのメニューからHostingを選ぶと、ダッシュボードにデプロイ履歴が記載されてる。

とりあえずここまででFirebaseにWebサイトを公開するところまで完了。

## カスタムドメインの設定
Firebaseの管理コンソールから、 Hostingを選択して、「ドメインを接続」　ボタンを押して、ウィザードの通りに実行する。
自分の場合はAWSのRoute 53でポチポチやった。
流れとしては、
1. DNSにTXTレコードを設定して、ドメインの管理者であることを証明
2. 与えられたIPv4をDNSにAレコードを貼る
3. SSL証明書がプロビジョニングされるまで待つ(Firebaseがやってくれる)
すでにGitHub PagesなどにホスティングしていてCNAMEやAレコードを貼っている場合は、2の前に外しておく。

ここまででWebサイトをFirebaseにホスティングしてもらい、独自ドメインを使ってさらにHTTPSに対応することができた。

## 自動デプロイ
GitHub Pagesの魅力の一つに、GitHub上のリポジトリにpushしたら自動でデプロイしてくれるというものがあったが、
今のままの構成だとその恩恵をウケられないのでCIにデプロイしてもらう。今回はCirlceCI 2.0を使う。　

### CI用のtokenの発行
firebase CLIでCI用のtokenを発行する
```
firebase login:ci
```
ブラウザでGoogleサインインすると、tokenが出力されるので控えておく。

### CircleCIの設定

.circleci/config.ymlを書く
{% highlight yaml %}
version: 2
jobs:
  build:
    working_directory: ~/repo
    docker:
      - image: circleci/ruby:latest
    steps:
      - checkout
      - run:
          name: Install firebase-tools
          command: |
            curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
            sudo apt-get install -y nodejs
            echo prefix=${HOME}/.local >> ~/.npmrc
            npm install -g firebase-tools
      - run:
          name: Install dependencies
          command: bundle install
      - run:
          name: Build
          command: make build
      - run:
          name: Deploy
          command: ~/.local/bin/firebase deploy --token $FIREBASE_TOKEN
{% endhighlight %}

CircleCIのprojectに、さっき取得したCI用tokenを環境変数として指定する。ここでは`FIREBASE_TOKEN`。

これでGitHubにpushするとデプロイされるようになった。

## まとめ
このブログはCircleCI, GitHub, Firebase Hostingに支えられています。
