---
title: "package.jsonに指定するdependencies, devDependenciesなどの使い方"
date: "2017-07-03 11:09:31 +0900"
---

## dependencies

module 名を key、バージョンを value とした Object で定義する。
{% highlight json %}
"dependencies": {
"react": "^15.6.0"
}

```

tarballやgitのURLも使うことができる。

## devDependencies
書き方は`dependencies`と同じ。ビルドやテスト、ドキュメント作成のためのフレームワークなど、対象となるmoduleの*開発*に必要な依存関係を記述する。
あるmoduleをインストールしたとき、そのmoduleにdevDependenciesとして指定されているmoduleは依存関係として解決されない。
CoffeeScript, TypeScriptなどのAltJSやES最新版をCommonJS向けにコンパイル/トランスパイルする必要があるmoduleの場合は、 `scripts.prepare` にビルドスクリプトを指定しておくとよい。

{% highlight json %}
"devDependencies": {
  "coffee-script": "~1.6.3"
}
"scripts": {
  "prepare": "coffee -o lib/ -c src/index.coffee"
}
```

これによって npm registry に publish される前に `scripts.prepare` で指定したコマンドが実行される。

## peerDependencies

書き方は`dependencies`と同じ。

対象となる module が特定の module の特定のバージョンに依存している時に使用する。
タスクランナーのプラグインが、そのタスクランナーの特定のバージョンでしか動作しないときなどに指定する。
peerDependencies に指定されている module がプロジェクトにインストールされてない場合警告が出る。

例えば、webpack-dev-server は peerDependency として[webpack を指定している](https://github.com/webpack/webpack-dev-server/blob/master/package.json#L7)ので、webpack-dev-server 単体でインストールしたときには動作せず、npm は警告を出してくれる。

package.json
{:.filename}

{% highlight json %}
{
"name": "npm-sample",
"dependencies": {
"webpack-dev-server": "^2.6.1"
}
}

```

```

$ npm install
npm WARN webpack-dev-server@2.6.1 requires a peer of webpack@^2.2.0 || ^3.0.0 but none was installed.
npm WARN webpack-dev-middleware@1.12.0 requires a peer of webpack@^1.0.0 || ^2.0.0 || ^3.0.0 but none was installed.

```

peerDependencyのエラーが出た時は指定されているdependencyが解決できるようにしなければならない。

package.json
{:.filename}

{% highlight json %}
{
  "name": "npm-sample",
  "dependencies": {
    "webpack": "^3.4.1",
    "webpack-dev-server": "^2.6.1"
  }
}
```

## bundledDependencies または bundleDependencies

package 名を配列で記述する。  
`npm pack`により npm package を tarball 形式で作成し、他のプロジェクトからその tgz ファイルを`npm install`したときに、bundleDependencies で指定した依存が解決される。

/tmp/npm-sample/package.json
{:.filename}
{% highlight json %}
{
"name": "npm-sample",
"version": "v0.0.0",
"dependencies": {
},
"bundledDependencies": ["colorpack"]
}

```

```

$ npm pack
npm-sample-0.0.0.tgz

```

/tmp/bundle-sample/package.json
{:.filename}
{% highlight json %}
{
  "name": "bundle-sample",
  "dependencies": {
    "npm-sample": "file:../npm-sample/npm-sample-0.0.0.tgz"
  }
}
```

/tmp/bundle-sample/package-lock.json
{:.filename}
{% highlight json %}
{
"name": "bundle-sample",
"version": "1.0.0",
"lockfileVersion": 1,
"requires": true,
"dependencies": {
"colorpack": {
"version": "0.0.2",
"resolved": "https://registry.npmjs.org/colorpack/-/colorpack-0.0.2.tgz"
},
"npm-sample": {
"version": "file:../npm-sample/npm-sample-0.0.0.tgz",
"requires": {
"colorpack": "0.0.2"
}
}
}
}

```

`/tmp/npm-sample`のpackage.json内でbundledDependenciesとして指定した`colorpack`が、依存関係として解決されてるのがわかる。

## optionalDependencies

名前の通り、必須ではないオプショナルなdependencyを指定する。optionalDependencyをコード内で使用する場合、dependencyがインストールされているかを判定する必要がある。
{% highlight js %}
try {
  var foo = require('foo')
  var fooVersion = require('foo/package.json').version
} catch (er) {
  foo = null
}
if ( notGoodFooVersion(fooVersion) ) {
  foo = null
}

if (foo) {
  foo.doFooThings()
}
```

# まとめ

ライブラリを作る時は`dependencies`, `devDependencies`, `peerDependencies`を使い分ける必要があるけど、製品作る時は全部`dependencies`もしくは`devDependencies`にまとめて書いちゃって問題なさそう。
分かりやすさのためにテストやビルドツールなんかは`devDependencies`、コード内で使用しているライブラリは`dependencies`に書いてもいいかなとは思う。

bundledDependencies は使いどころがよく分からない 🤔
