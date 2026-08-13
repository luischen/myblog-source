---
title: "Let's Encrypt 与 Nginx 快速部署"
date: 2026-07-10 14:17:22
updated: 2026-07-10 14:17:22
categories:
  - Manulism Work
tags:
  - "Manulism Work"
  - "Architecture"
source_path: "10_Architecture/14 架构和开发/Https/04-LetsEncrypt与Nginx快速部署.md"
---
# Let's Encrypt 与 Nginx 快速部署

如果只是想快速把站点切到 HTTPS，最常见的方式是让 Nginx 终止 TLS，然后通过 Let's Encrypt 自动申请和续期证书。

## 1. 为什么选这个方案

- Nginx 很适合作为统一入口，终止 TLS。
- Let's Encrypt 提供免费证书。
- 申请和续期可以自动化，手工运维成本低。

## 2. Let's Encrypt 的原理

Let's Encrypt 的核心是 `ACME` 协议。它不是“直接给你一张证书”，而是先验证你对域名的控制权，再签发证书。

运作逻辑可以概括为：

1. 申请者生成自己的私钥。
2. 申请者向 ACME 服务端发起签发请求。
3. ACME 要求申请者完成域名控制验证。
4. 通过验证后，CA 签发域名证书。
5. 证书有效期较短，需要自动续期。

## 3. 常见验证方式

- `HTTP-01`：在网站上放一个指定的校验文件，证明你能控制这个 HTTP 服务。
- `DNS-01`：在 DNS 里放一个指定记录，适合通配符证书，也适合无法开放 80 端口的场景。
- `TLS-ALPN-01`：通过 TLS 握手阶段完成验证，适合一些更专门的部署场景。

<pre>
证书申请流程
  ├─ 申请人生成私钥
  ├─ 向 ACME 发起申请
  ├─ 完成域名控制验证
  ├─ CA 签发证书
  └─ 自动续期并更新服务端配置
</pre>

## 4. 两种常见实施方式

### 4.1 让 Certbot 直接接管 Nginx

适合已经由 Nginx 代理站点的场景，Certbot 可以自动改写配置并申请证书。

```bash
certbot --nginx -d example.com -d www.example.com
```

优点是简单，适合快速落地；缺点是对 Nginx 配置自动化改动比较多，需要保留好原始配置。

### 4.2 使用 webroot 模式

适合你想自己掌控 Nginx 配置，只让 Certbot 负责签发和续期。

```bash
certbot certonly --webroot -w /var/www/html -d example.com -d www.example.com
```

这种方式下，Certbot 会把 ACME 验证文件放到指定站点目录里，再由 Nginx 对外提供访问。

## 5. HTTP-01 的 Nginx 配置

HTTP-01 验证的关键点是：

- CA 会访问 `http://example.com/.well-known/acme-challenge/...`
- 你的网站必须能把这个验证文件正确返回给外部
- 只有域名确实指向你当前的服务器，这一步才会成功

```nginx
server {
    listen 80;
    server_name example.com;

    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}
```

如果你用的是 `webroot`，就让 Certbot 把验证文件写到 `/var/www/html/.well-known/acme-challenge/`，CA 再来取文件完成校验。

## 6. DNS-01 适合什么情况

DNS-01 的思路不是访问网站，而是验证你是否能修改域名 DNS 记录。

- 适合通配符证书，例如 `*.example.com`
- 适合 80 端口不方便暴露的环境
- 适合有自动化 DNS API 的云环境

## 7. 自动续期

Let's Encrypt 证书有效期较短，运维重点不是“申请一次就完了”，而是“把续期做自动化”。

常见做法：

1. 定期执行续期命令。
2. 证书更新后 reload Nginx。
3. 用定时任务或 systemd timer 托管。

```bash
certbot renew --quiet
nginx -t && systemctl reload nginx
```

## 8. 部署检查项

- 域名解析是否正确指向服务器。
- 80 端口是否可达，HTTP-01 是否会被外部访问到。
- Nginx 是否允许 `/.well-known/acme-challenge/` 路径正常返回。
- 证书是否已经自动续期。
- 续期后是否成功 reload 了 Nginx。
- 是否需要通配符证书，如果需要就优先考虑 DNS-01。

## 9. 和其他专题的关系

- 想看证书结构，去看 [x509 证书与信任链](./02-x509证书与信任链.md)
- 想看 TLS 连接如何建立，去看 [HTTPS 与 TLS 基础](./01-HTTPS与TLS基础.md)

