---
title: ECH の config を well-known URI で配布するドラフトのメモ
tags:
  - TLS
  - IETF draft
date: "2023-02-17 23:23:23 +0900"
description: IETF でdraftとして議論が進められている A well-known URI for publishing ECHConfigList values. のメモ
draft: true
---

## Encrypted Client Hello (ECH) の設定の課題

現状 Chrome などで実装が進んでいる[ECH](https://chromestatus.com/feature/6196703843581952)は、サーバーが生成した ECH 用の公開鍵を DNS の`HTTPS` resource record の値の ECHConfigList に設定していることが前提になっている。
この DNS の resource record に依存するやり方は、サーバーの管理者が ECH 用の鍵を更新する際に

- サーバー管理者の管轄外の DNS に resource record が登録されている可能性がある
- 鍵の更新時に resource record の値を自動的に書き換える API が DNS プロバイダーから提供されていない
  という課題があった

## well-known URI と zone factory
