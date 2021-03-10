---
title: "React Nativeの一部のライブラリが原因でAndroidのビルドが失敗する件について"
date: "2018-03-22 10:00:00 +0900"
tags:
  - React Native
---

## 何が起こっているか
React Nativeプロジェクトで、react-native-cameraなどの一部のライブラリに依存しているとAndroidのビルドが失敗する現象が起きています。

```
Execution failed for task ':react-native-camera:processReleaseResources'.

> Error: more than one library with package name 'com.google.android.gms.license'
```

僕が気づいたのは21日の23:00頃でした。

## 原因
[Google Play servicesの12.0.0がリリースされた](https://developers.google.com/android/guides/releases)ことにより、ライブラリ内の `build.gradle` で
```
compile 'com.google.android.gms:play-services-vision:+'
```
のように、Google Play Servicesの最新バージョンを指定しているとビルドが失敗します。
(この例ではplay-services-vision)

## 解決策

Google Play Servicesのバージョンを11.8.0に固定することで、ひとまずこの問題は解決します。

しかし、本来は各ライブラリが12.0.0に対応すべきなので、あくまで一時的な対応であることに留意してください。

具体的には、次のAもしくはBどちらかを施すことでビルドエラーを回避することができます。

### A. package内のbuild.gradleを書き換える
問題が起きているpackage(今回の例ではreact-native-camera)内のbuild.gradle(`node_modules/react-native-camera/android/build.gradle`)を編集し、Google Play Servicesのバージョンを11.8.0に固定します。

before: `'com.google.android.gms:play-services-vision:+'`

after: `'com.google.android.gms:play-services-vision:11.8.0'`

### B. プロジェクトのbuild.gradleでGoogle Play Servicesのバージョンを11.8.0に固定する
`android/build.gradle`に以下のように記述することで、Google Play Servicesのバージョンを固定します。

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

react-native-cameraでは現在、Gradleの他のConfigの修正と合わせて対応が進んでいます。

- [https://github.com/react-native-community/react-native-camera/pull/1374](https://github.com/react-native-community/react-native-camera/pull/1374)
- [https://github.com/react-native-community/react-native-camera/pull/1380](https://github.com/react-native-community/react-native-camera/pull/1380)

### 参考
- [https://github.com/facebook/react-native/issues/18479](https://github.com/facebook/react-native/issues/18479)
- [https://github.com/react-native-community/react-native-camera/issues/1370](https://github.com/react-native-community/react-native-camera/issues/1370)


