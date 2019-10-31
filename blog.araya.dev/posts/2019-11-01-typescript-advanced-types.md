---
title: TypeScriptでよく使う実践的型宣言
tags:
    - TypeScript
    - JavaScript
    - memo
---

TypeScript書いててよく使う型宣言の自分用CheatSheet

## objectの型定義
### 実現したいこと
いくつかのkeyの文字列、valueの型が不明なobjectの型定義
```javascript
const user = {
    id: '1', // required
    firstName: 'Homura', // optional
    lastName: 'Akemi', // optional
    age: 14, // 予期してないが使いたい
}
```

### 実現方法
```typescript
type User = {
    id: string;
    firstName?: string;
    lastName?: string;
    [key: string]: unknown;
}
```
or
```typescript
type User = {
    id: string;
    firstName?: string;
    lastName?: string;
} & Record<string, unknown>
```
どちらでもいいが、この場合は前者のほうが見やすい

## enumを置き換える
### 実現したいこと
```javascript
const colors = {
    red: 'RED',
    blue: 'BLUE',
    green: 'GREEN'
}
const setColor = (color) => {
    // use color
}
setColor('RED')
setColor('PINK')
```
`color`のプロパティとして宣言された文字列以外は型検査で落としたい

### enumで解決
```typescript
enum Colors {
    Red =  'RED',
    Blue = 'BLUE',
    Green = 'GREEN'
}
const setColor = (color: Colors) => {
    // use color
}

setColor(Colors.Blue)
setColor('PINK') // Error!
// Argument of type '"PINK"' is not assignable to parameter of type 'Colors'.
```

enumはコンパイル後のJSがつらい
```javascript
"use strict";
var Colors;
(function (Colors) {
    Colors["Red"] = "RED";
    Colors["Blue"] = "BLUE";
    Colors["Green"] = "GREEN";
})(Colors || (Colors = {}));
const setColor = (color) => {
    // use color
};
setColor(Colors.Blue);
setColor('PINK');
```

### type utilityで解決
```typescript
const Colors = {
    Red: 'RED',
    Blue: 'BLUE',
    Green: 'GREEN'
} as const
type Value<T extends object> = T[keyof T];
type Color = Value<typeof Colors> // Colorsのプロパティがreadonlyのため、string literal tyepとして使える
const setColor = (color: Color) => {
    // use color
};
setColor(Colors.Blue);
setColor('GREEN');
setColor('PINK'); // Error!
// Argument of type '"PINK"' is not assignable to parameter of type '"RED" | "BLUE" | "GREEN"'
```
後者だと、string literal typeの不一致でエラーがでるため、有効な値がわかりやすい。

コンパイル後のJSも直感的
```javascript
"use strict";
const Colors = {
    Red: 'RED',
    Blue: 'BLUE',
    Green: 'GREEN'
};
const setColor = (color) => {
    // use color
};
setColor(Colors.Blue);
setColor('GREEN');
setColor('PINK');
```

## 継承関係にある型の親から子への絞り込み

