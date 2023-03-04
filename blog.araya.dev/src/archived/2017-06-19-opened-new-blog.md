---
title: "ブログをはてなブログからお引越しした"
date: "2017-06-19"
tags:
  - 雑記
  - jekyll
---

[rioRESERVoir](http://allajah.hatenablog.com/) というはてなブログで作ったブログを運用してたけど、
jekyll + GitHub Pages での運用に切り替えてみた。

jekyll + GitHub Pages 以外にも、Wordpress、 Medium、はてなブログ を検討したけど、下記のような理由で今の構成にした。

### Wordpress

- サーバー、インフラの構築およびメンテナンスが必要
- プラグインの管理が辛い

### はてなブログ

- 重い(ページのローディングが遅い)
- Hatena Blog Pro の価格が高い(月額 1008 円)

### Medium

- 日本語がかっこよくない
- スタイルシートをカスタマイズできない
- 世界各国(日本含む)で行ってたローカライズ等の運営をストップし、HQ のあるサンフランシスコに[フォーカスした](https://medium.com/@MEJapan/from-medium-japan-ad346bee2a9b)

もちろん、各ブログサービスやプラットフォーム便利な機能は多々あるけど、それを考慮しても今はこのシンプルな構成が自分に合ってるなーと思った。

GitHub Pages はホント最高で、サーバーのメンテナンスいらないし無償で運用できるのは本当に良い。感謝しかない 🙏

CNAME 貼って独自ドメイン使えるし、DNS 挟めば SSL も貼れるしね。独自ドメイン+https で無償運用したい時、DNS は[CloudFlare を選択するのが良さそう](http://qiita.com/superbrothers/items/95e5723e9bd320094537)。

そろそろアウトプットを徐々に増やしていきたい年頃なので、いい感じのペースで書いていきたいと思っております。よろしくお願いします。 🙇

## 開発秘話

この Web サイトのソースコードは[GitHub で公開しています](https://github.com/Allajah/allajah.github.io)。

テーマは [scribble](https://github.com/muan/scribble) をカスタマイズして使わさせてもらっています。
