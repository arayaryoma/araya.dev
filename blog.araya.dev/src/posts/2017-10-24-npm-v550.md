---
title: "npm v5.5.0の新機能"
date: "2017-10-24 18:15:01 +0900"
tags:
  - npm
---

npm v5.5.0が10/4にリリースされました。若干今更感もありますが、v5.5.0で入った新機能について触れたいと思います。

今回のリリースでプロフィール周りの設定をコマンドラインから行いやすくなりました。　

## 2要素認証
npmのアカウントに2要素認証を設定できるようになりました。
```
npm profile enable-tfa
```
で設定できます。npmjs.comのWebサイト内から設定する項目は見つかりませんでした。

## トークン管理
`npm token`コマンドで、tokenのCreate, List, Updateができるようになりました。
また、token作成時に`npm token create --read-only`と`--read-only`オプションをつけることで、
対象tokenを使ってのnpm moduleの更新や新規作成ができなくなります。
ただ、`read-only`の名の通りプライベートなnpm moduleをダウンロードすることが出来るので、
CIなどに設定するトークンとして有効です。

## パスワードの変更とEメールアドレスの設定
`npm profile set password` でCLIからパスワードを変更することができるようになりました。

また、`npm profile set email <e-mail address>`でメールアドレスを変更できるようになりました。
Eメールアドレスを変更した後は、npmから送られてくるverification mailから、承認する必要があります。

## その他プロフィールの変更
CLIから、npm profileのTwitterやGitHubなども更新することができるようになりました。
例えば、Twitterアカウントを変更するには、
```
npm profile set twitter _araya_
```
とします。

## スタンドアローンなnpm packageとしても利用可能
ここまで紹介した機能は全て[npm-profile](https://www.npmjs.com/package/npm-profile)
でも利用可能です。

## まとめ
2FA設定できるようになったのは良いですね。
private npm module使ったことないけど、常用してる人にとっては、Read only tokenは便利そうです。
