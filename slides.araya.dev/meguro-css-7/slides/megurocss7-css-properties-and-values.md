# Chrome 78 Betaで試すCSS Properties and Values API

#### Meguro.css #7 @ ラクスル

#### あらや @arayaryoma

---

## 自己紹介
![avatar](./images/profile-icon.png)
- :man-raising-hand: あらや
- :bird: Twitter: [@arayaryoma](https://twitter.com/arayaryoma)
- :computer: Web engineer at Hematite Inc.
- :heart: Web standards, TypeScript, Go

---

## CSS Properties and Values APIとは
- [CSS Houdini](https://drafts.css-houdini.org/)の1つ
- CSSのCustom Propertiesを構造化するためのAPI
- CSSのCustom Propertyに初期値とsyntax(型のようなもの)を指定することができる
- [Chrome 78に搭載予定](https://blog.chromium.org/2019/09/chrome-78-beta-new-houdini-api-native.html)

---

## API
#### 使える関数は現在`window.CSS.registerProperty`のみ
```javascript
window.CSS.registerProperty({
  name: '--property-name',  // 対象のcustom propertyの名前
  syntax: '*',              // 値をどうパースするか
  inherits: true,           // 親要素の値を継承するか
  initialValue: '',         // 初期値
});
```

#### supported syntax
syntaxに使える文字列は
[draft](https://drafts.css-houdini.org/css-properties-values-api/#supported-names)
で定義されている。

- `<length>`
- `<number>`
- `<percentage>`
- `<color>`
- `<image>`
- ...など

---

### 一度registerしたpropertyはre-registerできない

```javascript
CSS.registerProperty({
    name: '--my-color',
    inherits: false,
    initialValue: '#55CC55',
    syntax: '<color>'
})

CSS.registerProperty({
    name: '--my-color',
    inherits: false,
    initialValue: 'black',
    syntax: '<color>'
})
/*
Uncaught DOMException: Failed to execute 'registerProperty' on 'CSS':
The name provided has already been registered.
*/
```

---

### 呼び出し時にsyntaxに一致しない値を指定するとErrorが吐かれる
```javascript
CSS.registerProperty({
  name: '--box-color',
  syntax: '<url>',
  inherits: false,
  initialValue: '#FFFFFF',
});
/*
Uncaught DOMException: Failed to execute 'registerProperty' on 'CSS': 
The initial value provided does not parse for the given syntax.
*/
```
---

## Demo
[https://playground.araya.dev/css-properties-and-values-api/](https://playground.araya.dev/css-properties-and-values-api/)

---

## 試用方法
- Chrome: Beta, Dev, Canary channel
- Safari: Technology PreviewでExperimental FeaturesからCSS Custom Properties and Values APIを有効にする
    - ただ発表者が試したところ動かなかった
---

## 各ブラウザの対応状況
### [http://ishoudinireadyyet.com/](http://ishoudinireadyyet.com/)
![各ブラウザの対応状況](./images/css-houdini-browsers2019-10.png)

---

## 参考リンク集
- [https://web.dev/css-props-and-vals/](https://web.dev/css-props-and-vals/)
- [https://drafts.css-houdini.org/css-properties-values-api/#supported-names](https://drafts.css-houdini.org/css-properties-values-api/)
- [http://ishoudinireadyyet.com/](http://ishoudinireadyyet.com/)
