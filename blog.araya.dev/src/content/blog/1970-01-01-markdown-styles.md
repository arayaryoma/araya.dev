---
title: Markdown Stylesheets playground
tags:
date: "1970-01-01 00:00:00"
description: Markdown の stylesheets を試すためのページ
---

# 見出し 1 / Heading 1

## 見出し 2 / Heading 2

### 見出し 3 / Heading 3

#### 見出し 4 / Heading 4

##### 見出し 5 / Heading 5

###### 見出し 6 / Heading 6

---

# 番号付きリスト / Ordered List

1. 1 番目
1. 2 番目
   1. 2-1 番目
   1. 2-2 番目
1. 3 番目

# 箇条書きリスト / Unordered List

- 1 番目
- 2 番目
  - 2-1 番目
  - 2-2 番目
- 3 番目

# 引用 / Blockquote

> これは引用です / This is quote

> 複数行に渡る引用
> Ullamco do voluptate qui excepteur esse. Veniam mollit culpa quis Lorem aute laboris nostrud. Magna aliquip ipsum culpa sint anim consequat aute anim. Laboris officia sint cillum consectetur esse minim tempor culpa occaecat pariatur anim qui. Ea eiusmod et aliquip magna fugiat non in proident occaecat. Esse et anim do occaecat ipsum tempor et aute nostrud. Ad ea aute tempor fugiat nulla dolore ut anim nostrud.
>
> Aute mollit cillum id reprehenderit aliquip ex ut officia amet. Laboris ullamco aliqua culpa amet ullamco nulla Lorem proident commodo nulla eu cupidatat officia. Nisi quis veniam magna tempor laborum officia nulla mollit cillum id dolor Lorem. Sit aliqua nisi veniam aliqua veniam culpa laborum et sint elit aute id do.

# 段落 / Paragraph

舞台ははんのかっこう両手屋にゴーシュで思う床ませる。するとしばらく俄たんという外たです。愉快でしましのなくはましけれどもゴーシュの粗末たちのところがはすっかり楽じございで、そればかり専門をしれんたた。云いすぎわたしは楽長がないまして夜の野ねずみの楽長らからつかれ第一長椅子館の安心が通りていたず。へんも夜きいてやっまし。

病院も一落ちるあたりのようからたべるとくださいた。ゴーシュこそ先生療とみんなを来てやるだ。ゴーシュはどなりをすこしに過ぎて鳥をゴーシュのようを走って風に弾きてむしゃくしゃ雲へ行くていた。

もう何だかねどこを野ねずみの見んない。おれまっすぐに怒りをなりて窓がありうます。顔へならですで。「ょってじぶんのへ睡った。虎、何を耳。

これは文章中の[リンク](#)。`文章中の<code> は`こうなる。

Incididunt cupidatat] duis aute eu sint qui duis dolore. Reprehenderit irure deserunt est velit id quis incididunt enim enim amet aute officia. Excepteur laboris mollit exercitation nisi irure proident veniam sit sunt sint sunt id Lorem non. Dolor commodo proident ullamco fugiat sit incididunt. Amet anim amet dolore qui sit ex excepteur commodo do eiusmod laboris reprehenderit amet. Id occaecat excepteur ipsum proident est amet id do deserunt cupidatat.

Cupidatat irure quis nisi eu veniam cupidatat duis cupidatat proident. Dolore enim in ea veniam occaecat esse elit nulla. Commodo velit proident magna eu cillum consequat labore et aute anim officia. Voluptate cillum voluptate irure id. Dolor esse exercitation excepteur in eu duis esse deserunt commodo dolor.

Cupidatat esse nostrud ex do non exercitation Lorem amet. Velit velit duis culpa exercitation eu fugiat proident fugiat exercitation. Officia nisi anim commodo ea in.

# コードブロック / Code block

```js
const readdirRecursively = async (dir, files = []) => {
  const dirents = await fsPromises.readdir(dir, { withFileTypes: true });
  const dirs = [];
  for (let dirent of dirents) {
    if (dirent.isDirectory()) dirs.push(`${dir}/${dirent.name}`);
    if (dirent.isFile()) files.push(`${dir}/${dirent.name}`);
  }
  for (let d of dirs) {
    files = readdirRecursively(d, files);
  }
  return Promise.resolve(files);
};
```

# 表 / Table

| head A | head B | head C |
| :----- | :----: | -----: |
| 左寄せ |  中央  | 右寄せ |

# 画像

![テスト表示用のデフォルトサムネイル画像](/assets/images/default-thumbnail.svg)
