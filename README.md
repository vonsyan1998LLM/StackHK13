# StackHK（airecmark.com）— 全新后端版

前端沿用原站静态页面（零改动迁移），后端为全新开发的 Cloudflare Pages Functions + KV，后台为全新 `/console-9k4f/` 单页应用。**不包含旧系统的任何文件**（`_worker.js`、旧 `functions/`、`notepage/` 均未带入）。

> 历史注记：旧版 `_worker.js` 为 Advanced Mode，会让**每一次页面访问都消耗一次 Workers 调用**，在免费版每日 10 万次配额下被爬虫流量耗尽，导致全账号 Functions 停止执行——这是旧后台"无法修复"的根因（2026-08-29 确认）。本仓库不使用 `_worker.js`，只保留 `functions/`（仅 `/api/*`、`/assets/*` 路径产生调用），若走 Workers 部署路径则由 `wrangler-workers.jsonc` 的 `run_worker_first` 限定调用范围。

## 架构

```
前端（静态，未改） ──GET /api/data──┐
                                   ▼
/js/tp-main.js         Cloudflare Pages Functions（functions/，唯一后端机制）
                                   │
后台 /console-9k4f/（SPA）────读写─────────┼── KV（stackhk-data 命名空间，绑定名 STACKHK）
                                   │     site:data / site:meta / backup:site:*
submit.html ──POST /api/submissions┘     data:submissions:* / img:* / rl:*
```

- 数据以 KV `site:data` 为准；KV 为空时自动回落仓库内置 `api-seed.json`，前台永不白屏。
- 前台缓存 60 秒：后台保存后 ≤1 分钟前台生效。

## 目录

| 路径 | 说明 |
|---|---|
| `functions/_lib/` | 工具库：响应/常量比较、PBKDF2+HMAC、会话、限流、校验、KV 存取 |
| `functions/api/` | health、auth（login/logout/session）、data、submissions、backups（列表/恢复）、upload、meta |
| `functions/assets/[id].js` | 上传图片输出（immutable 缓存） |
| `admin/` | 后台 SPA（原生 JS，无构建、无第三方依赖） |
| `worker/` + `wrangler-workers.jsonc` | Workers 静态资产部署预案（Pages Functions 不可用时启用） |
| `wrangler.toml` | Pages 项目配置：KV 绑定 + 非密钥变量 |

## 部署（Direct Upload 方式）

```bash
npm i -g wrangler
set CLOUDFLARE_API_TOKEN=<具有 Pages 编辑权限的 Token>
set CLOUDFLARE_ACCOUNT_ID=f3c243d01277c2479426f92c3e40e4c8

wrangler pages deploy --branch master
```

Secrets（仅首次或轮换时设置，值不进仓库）：

```bash
echo <salt_hex> | wrangler pages secret put ADMIN_PASSWORD_SALT --project-name stackhk13
echo <hash_hex> | wrangler pages secret put ADMIN_PASSWORD_HASH --project-name stackhk13
echo <secret_hex> | wrangler pages secret put ADMIN_SESSION_SECRET --project-name stackhk13
```

- 密码哈希 = PBKDF2-SHA256（10,000 轮，32 字节；受免费版 CPU 限制未用更高轮数）。**注意盐要先从 hex 解码成字节**：
  `node -e "const c=require('crypto');const salt=c.randomBytes(16).toString('hex');console.log(salt, c.pbkdf2Sync('<新密码>',Buffer.from(salt,'hex'),10000,32,'sha256').toString('hex'))"`
- `ADMIN_USERNAME` / `SITE_VERSION` 在 wrangler.toml 的 `[vars]` 里，改完重新 deploy。

> Workers 部署路径：`wrangler deploy -c wrangler-workers.jsonc`，secrets 用 `wrangler secret put`（不带 --project-name）。

## 部署后 30 秒冒烟（每次必做）

```bash
curl -s https://<部署域名>/api/health   # 必须返回 JSON；返回 HTML = Functions 未执行，先查当日调用配额
curl -s https://<部署域名>/api/data | head -c 200
curl -s -o NUL -w "%{http_code}" https://<部署域名>/console-9k4f/   # 200
```

## 后台使用

- 入口：`/console-9k4f/`（noindex）。首次登录使用既定管理员账号。
- 「工具 / 新闻 / 指南 / 课程 / 设置」全部为本地编辑 + 右上角「保存全部更改」整单提交；每次保存自动生成快照，可在「备份恢复」一键回滚。
- 「提交审核」：submit.html 的新提交在此列表，「采纳为工具草稿」会立即保存并删除该提交。
- 「Logo 库」：上传 ≤150KB 图片（存 KV，经 `/assets/` 输出），在工具编辑器中选用。

## 安全要点

- 会话：HttpOnly + Secure + SameSite=Strict 签名 Cookie，12 小时；写请求强制 CSRF 头。
- 登录限流 5 次/分钟/IP；提交限流 10 次/分钟/IP + 蜜罐 + 最短填写时间。
- 密码 PBKDF2 校验，Secret 全部存于 Pages Secrets / Workers Secrets，不出现在代码与仓库中。
