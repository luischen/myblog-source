---
title: "调用外部 HTTPS 服务"
date: 2026-07-10 14:31:52
updated: 2026-07-10 14:31:52
categories:
  - 工作笔记
tags:
  - "工作笔记"
  - "Architecture"
source_path: "10_Architecture/14 架构和开发/Https/05 调用外部Https服务.md"
---
# 调用外部 HTTPS 服务

当 Java 程序调用外部 HTTPS 服务时，如果 JVM 不信任对方证书，就会出现证书链校验失败。

常见报错如下：

```text
sun.security.validator.ValidatorException: PKIX path building failed:
sun.security.provider.certpath.SunCertPathBuilderException:
unable to find valid certification path to requested target
```

这类问题的本质通常不是“网络不通”，而是“JVM 无法把目标服务的证书链连接到自己信任的根证书”。

## 1. 问题现象

- 程序可以连到目标地址，但 HTTPS 握手失败。
- 报错通常出现在 `RestTemplate`、`WebClient`、`HttpClient` 或第三方 SDK 中。
- 目标服务在浏览器里可能是正常的，但 Java 进程仍然报不信任。

## 2. 常见原因

- 目标服务使用了自签名证书。
- 目标服务证书链不完整。
- 证书由内部 CA 签发，但 JVM truststore 里没有对应 CA。
- 使用了新的证书，但应用还在读旧的 truststore。
- 证书域名和访问域名不匹配，触发了额外校验失败。

## 3. 解决思路

通常有两种做法：

1. 把目标服务信任链导入 JVM 的 truststore，让 JVM 直接信任它。
2. 在应用里显式指定自定义信任库或证书工厂，只让这一个客户端信任目标服务。

一般建议优先选择第一种，因为它更符合生产环境的信任管理方式。

## 4. 方案一：导入 JVM truststore

这是最常见、也最容易长期维护的方案。

### 4.1 适合什么场景

- 内部系统调用固定域名的 HTTPS 服务。
- 目标证书链稳定。
- 希望所有基于该 JVM 的客户端都能信任这个服务。

### 4.2 推荐做法

通常更建议导入签发目标服务证书的 CA 证书或中间证书链，而不是只导入单张叶子证书。这样后续服务端证书更新时，客户端侧不一定要频繁改。

### 4.3 导入命令

```bash
keytool -importcert ^
  -alias target-service-ca ^
  -file C:\Users\manulism\Desktop\fsdownload\chain.pem ^
  -keystore D:\develop\jdk1.8.0_121\jre\lib\security\cacerts
```

执行过程中通常需要输入 truststore 密码，默认 JDK `cacerts` 常见密码是 `changeit`。

### 4.4 导入后要做什么

- 重启 Java 应用进程。
- 如果是容器化部署，确认镜像里的 truststore 已经更新。
- 如果服务有多个 JVM 实例，要确认每个实例都加载了新的 truststore。

### 4.5 注意事项

- 不要随意把不可信的公钥或证书导入全局 truststore。
- 如果是生产环境，最好使用独立 truststore，而不是直接改 JDK 自带的 `cacerts`。
- 如果证书是轮换发布的，要确认链路里有稳定的 CA 证书可用。

## 5. 方案二：应用内指定信任库

如果只想让某一个调用外部 HTTPS 的客户端信任特定证书，可以在代码里创建定制化的 SSL 请求工厂。

### 5.1 适合什么场景

- 只想影响某一个服务调用，不想修改全局 JVM truststore。
- 目标服务证书是临时环境、测试环境或专属内网服务。
- 应用里有明确的证书加载逻辑和配置管理。

### 5.2 RestTemplate 示例

```java
ClientHttpRequestFactory requestFactory =
    createSslAwareRequestFactory(resourceLoader, environment);

if (requestFactory != null) {
    restTemplate.setRequestFactory(requestFactory);
}
```

这段代码的重点不在于 `RestTemplate` 本身，而在于 `createSslAwareRequestFactory(...)` 里创建的 SSL 上下文。

通常实现上会做这些事：

- 从配置文件或资源目录加载证书文件。
- 构建 `KeyStore` 或 `TrustStore`。
- 使用该 truststore 初始化 `SSLContext`。
- 把 `SSLContext` 注入 HTTP 客户端。

### 5.3 这种方式的优缺点

优点：

- 隔离性好，不影响其他 HTTP 调用。
- 便于做多环境切换。
- 适合局部定制信任策略。

缺点：

- 代码复杂度更高。
- 需要自己维护证书加载和更新逻辑。
- 如果项目里有多个 HTTP 客户端，容易出现配置不一致。

## 6. 排查顺序

当你看到 `PKIX path building failed` 时，可以按下面顺序查：

1. 先确认目标服务证书链是否完整。
2. 再确认 JVM 是否已经信任对应 CA。
3. 再确认访问域名和证书 `SAN` 是否匹配。
4. 再确认应用加载的是不是正确的 truststore。
5. 最后再看是否是代理、网关或中间层改写了 TLS 链路。

## 7. 建议的实践

- 生产环境尽量使用独立 truststore。
- 内部服务优先信任 CA，而不是单独信任某一张叶子证书。
- 证书更新时同步检查应用配置和重启策略。
- 不要把关闭证书校验当作长期方案。

## 8. 小结

调用外部 HTTPS 服务报错时，核心问题几乎总是“信任链不成立”。

- 如果希望全局生效，就把 CA 链导入 JVM truststore。
- 如果只想局部生效，就在客户端里注入自定义 SSL 配置。
- 如果是长期生产场景，优先考虑稳定的 CA 管理和证书更新流程。

