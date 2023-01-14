---
title: "React Nativeの一部のライブラリが原因でAndroidのビルドが失敗する件について"
date: "2018-03-22 10:00:00 +0900"
tags:
  - React Native
layout: ../../layouts/Post.astro
---

## 何が起こっているか

React Native プロジェクトで、react-native-camera などの一部のライブラリに依存していると Android のビルドが失敗する現象が起きています。

```
Execution failed for task ':react-native-camera:processReleaseResources'.

> Error: more than one library with package name 'com.google.android.gms.license'
```

僕が気づいたのは 21 日の 23:00 頃でした。

## 原因

[Google Play services の 12.0.0 がリリースされた](https://developers.google.com/android/guides/releases)ことにより、ライブラリ内の `build.gradle` で

```
compile 'com.google.android.gms:play-services-vision:+'
```

のように、Google Play Services の最新バージョンを指定しているとビルドが失敗します。
(この例では play-services-vision)

## 解決策

Google Play Services のバージョンを 11.8.0 に固定することで、ひとまずこの問題は解決します。

しかし、本来は各ライブラリが 12.0.0 に対応すべきなので、あくまで一時的な対応であることに留意してください。

具体的には、次の A もしくは B どちらかを施すことでビルドエラーを回避することができます。

### A. package 内の build.gradle を書き換える

問題が起きている package(今回の例では react-native-camera)内の build.gradle(`node_modules/react-native-camera/android/build.gradle`)を編集し、Google Play Services のバージョンを 11.8.0 に固定します。

before: `'com.google.android.gms:play-services-vision:+'`

after: `'com.google.android.gms:play-services-vision:11.8.0'`

### B. プロジェクトの build.gradle で Google Play Services のバージョンを 11.8.0 に固定する

`android/build.gradle`に以下のように記述することで、Google Play Services のバージョンを固定します。

```
allprojects {
    repositories {
        configurations.all {
            resolutionStrategy {
                force "com.google.android.gms:play-services-vision:11.8.0"
            }
        }
    }
}
```

react-native-camera では現在、Gradle の他の Config の修正と合わせて対応が進んでいます。

- [https://github.com/react-native-community/react-native-camera/pull/1374](https://github.com/react-native-community/react-native-camera/pull/1374)
- [https://github.com/react-native-community/react-native-camera/pull/1380](https://github.com/react-native-community/react-native-camera/pull/1380)

### 参考

- [https://github.com/facebook/react-native/issues/18479](https://github.com/facebook/react-native/issues/18479)
- [https://github.com/react-native-community/react-native-camera/issues/1370](https://github.com/react-native-community/react-native-camera/issues/1370)
