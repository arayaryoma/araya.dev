---
title: "Firebase Hostingを使って静的Webサイトを独自ドメインかつSSL証明書付きで公開する"
date: "2017-10-26 15:41:04 +0900"
layout: ../../layouts/Post.astro
---

ブログのホスティング先を GitHub Pages から Firebase Hosting に変えてみた。

## Firebase Hosting とは

その名の通り Firebase が Web サイトをホスティングしてくれるサービス。

[https://firebase.google.com/docs/hosting/](https://firebase.google.com/docs/hosting/)

嬉しいポイントは

> Zero-configuration SSL is built into Firebase Hosting so content is always delivered securely.

ここにあって、なんと独自ドメインでも SSL をサポートしてくれる。

[料金](https://firebase.google.com/pricing/)も、フリーでそこそこ使えて、ホスティングしてくれるファイルの最大容量は計 1GB・
月 10GB まで配信できる。
個人ブログくらいならフリーで間に合うし、足りなくなっても月$25 払えば 10GB ストア・月 50GB 配信できるので安くすむ。

## Firebase でのセットアップ

[Firebase の Console](https://console.firebase.google.com/)にログインして新規プロジェクトを作成する。

## セットアップ

Firebase CLI を npm でインストールする

```
npm install -g firebase-tools
```

## Firebase CLI でログインする

```
firebase login
```

ブラウザが起動して、Google アカウントでサインインが求められるのでサインインする。

## プロジェクトの設定をする

```
firebase init
```

対話型でまずカレントディレクトリを設定する目的を聞いてくる。

```
Which Firebase CLI features do you want to setup for this folder?
```

ここでは `Hosting` を選択する。

次に、設定する Firebase のプロジェクトを聞いてくるので、さきほど作成した Firebase プロジェクトを選択する。

```
Select a default Firebase project for this directory:
```

次に、どのディレクトリを public directory に選択するか聞かれる。
ここに設定したディレクトリが root として Firebase にデプロイされるので、
Web サイトの場合は`index.html`が格納されている、ビルドしたディレクトリ(`dist`など)を指定する。
jekyll の場合は`_site`が該当するので、それを指定する。

```
 What do you want to use as your public directory?
```

次に、プロジェクトを Single Page Application として設定するか聞いてくる。
`yes`にすると URL を全て/index.html にリダイレクトさせる。
今回の場合は`NO`でいい。

```
Configure as a single-page app (rewrite all urls to /index.html)? (y/N)
```

```
 Firebase initialization complete!
```

ここまで完了すると、`.firebaserc`と`firebase.json`が作成される。
プロジェクト ID や、`firebase init`で設定した項目を変えたい場合は編集する。

## ビルド

jekyll の場合は`_config.yml`の`url`フィールドを変更する必要がある
Firebase のコンソールにアクセスし、projectID を確認する。
デプロイ先の URL は`https://{project_id}.firebaseapp.com`になるので、これを`url`フィールドに設定する(`{project_id}`は置き換える)。

## デプロイ

```
firebase deploy
```

デプロイ完了。Firebase Console のメニューから Hosting を選ぶと、ダッシュボードにデプロイ履歴が記載されてる。

とりあえずここまでで Firebase に Web サイトを公開するところまで完了。

## カスタムドメインの設定

Firebase の管理コンソールから、 Hosting を選択して、「ドメインを接続」　ボタンを押して、ウィザードの通りに実行する。
自分の場合は AWS の Route 53 でポチポチやった。
流れとしては、

1. DNS に TXT レコードを設定して、ドメインの管理者であることを証明
2. 与えられた IPv4 を DNS に A レコードを貼る
3. SSL 証明書がプロビジョニングされるまで待つ(Firebase がやってくれる)
   すでに GitHub Pages などにホスティングしていて CNAME や A レコードを貼っている場合は、2 の前に外しておく。

ここまでで Web サイトを Firebase にホスティングしてもらい、独自ドメインを使ってさらに HTTPS に対応することができた。

## 自動デプロイ

GitHub Pages の魅力の一つに、GitHub 上のリポジトリに push したら自動でデプロイしてくれるというものがあったが、
今のままの構成だとその恩恵をウケられないので CI にデプロイしてもらう。今回は CirlceCI 2.0 を使う。

### CI 用の token の発行

firebase CLI で CI 用の token を発行する

```
firebase login:ci
```

ブラウザで Google サインインすると、token が出力されるので控えておく。

### CircleCI の設定

.circleci/config.yml を書く
{% highlight yaml %}
version: 2
jobs:
build:
working_directory: ~/repo
docker: - image: circleci/ruby:latest
steps: - checkout - run:
name: Install firebase-tools
command: |
curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
sudo apt-get install -y nodejs
echo prefix=${HOME}/.local >> ~/.npmrc
npm install -g firebase-tools - run:
name: Install dependencies
command: bundle install - run:
name: Build
command: make build - run:
name: Deploy
command: ~/.local/bin/firebase deploy --token $FIREBASE_TOKEN

```

CircleCIのprojectに、さっき取得したCI用tokenを環境変数として指定する。ここでは`FIREBASE_TOKEN`。

これでGitHubにpushするとデプロイされるようになった。

## まとめ
このブログはCircleCI, GitHub, Firebase Hostingに支えられています。
```
