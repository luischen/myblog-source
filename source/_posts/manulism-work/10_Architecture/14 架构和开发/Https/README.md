---
title: "HTTPS 知识索引"
date: 2026-07-10 14:17:19
updated: 2026-08-13 15:56:58
categories:
  - 工作笔记
tags:
  - "工作笔记"
  - "Architecture"
source_path: "10_Architecture/14 架构和开发/Https/README.md"
---
这组笔记按“小专题”拆开，方便单独阅读，也方便后续持续补充。

## 阅读顺序

1. [HTTPS 与 TLS 基础](./01-HTTPS与TLS基础.md)
2. [x509 证书与信任链](./02-x509证书与信任链.md)
3. [设备认证中的 x509 证书](./03-设备认证中的x509证书.md)
4. [Let's Encrypt 与 Nginx 快速部署](./04-LetsEncrypt与Nginx快速部署.md)
5. [调用外部 HTTPS 服务](./05%20调用外部Https服务.md)

## 主题地图

- 协议层：HTTPS 做了什么，TLS 握手如何工作。
- 证书层：x509 证书包含什么，信任链如何建立。
- 设备层：设备如何用证书证明身份并完成接入。
- 运维层：如何用 Nginx 和 Let's Encrypt 快速部署 HTTPS。
- 应用层：Java 程序如何信任外部 HTTPS 服务。

## 快速入口

- 想先理解整体流程，去看 [HTTPS 与 TLS 基础](./01-HTTPS与TLS基础.md)
- 想理解证书结构和验证逻辑，去看 [x509 证书与信任链](./02-x509证书与信任链.md)
- 想看工业/IoT 设备接入，去看 [设备认证中的 x509 证书](./03-设备认证中的x509证书.md)
- 想快速上线站点 HTTPS，去看 [Let's Encrypt 与 Nginx 快速部署](./04-LetsEncrypt与Nginx快速部署.md)
- 想排查 Java 调外部 HTTPS 服务报错，去看 [调用外部 HTTPS 服务](./05%20调用外部Https服务.md)
