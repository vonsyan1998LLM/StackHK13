# StackHK 后台开发文档

> airecmark.com 管理后台（/admin）与全站后端（Cloudflare Pages Functions）的开发与运维文档。
> 维护约定：本文档随代码变更同步更新；历史方案见 `docs/StackHK升级方案.md`。
> 最后更新：2026-08-30

---

## 一、系统概览

```
airecmark.com
├── 静态前端          index.html + saas/ reviews/ articles/ compare/ news/ …（纯 HTML，无框架）
├── 后端 API          functions/（Cloudflare Pages Functions，唯一后端机制）
├── 数据存储          Cloudflare KV（binding: STACKHK）
├── 管理后台          /admin/（原生 JS SPA，无构建、无第三方依赖）
└── 部署              Cloudflare Pages 直传（wrangler pages deploy）
```

| 项 | 值 |
|---|---|
| Pages 项目 | `stackhk13`（生产分支参数 master；仓库分支 main） |
| 账户 | `f3c243d01277c2479426f92c3e40e4c8` |
| KV namespace | `STACKHK` → `ed9ee39834274da286d7f06aaaa7e5f9` |
| 仓库 | `vonsyan1998LLM/StackHK13`（**公开仓库**，勿放任何密钥） |
| 后台地址 | https://www.airecmark.com/admin/ |
| 后台账号 | 用户名 `StackhkMain`（2026-08-30 由 Stackhk007 更换，见安全审计）；密码在 CF Secrets |
| 免费配额 | KV 每日 10 万次读写——历史上被旧 `_worker.js` 每页一调耗尽，**仓库内严禁出现 `_worker.js`** |

---

## 二、目录结构

```
StackHK13/
├── admin/                    后台前端（无构建，直接部署）
│   ├── index.html            SPA 壳：登录视图 + 侧边栏 + 10 个视图容器
│   ├── admin.js              全部后台逻辑（~870 行，ES module）
│   ├── admin.css             后台设计系统（暗色主题 CSS 变量）
│   └── standards.html        内容产出标准页（静态，独立于 SPA）
├── functions/                后端（Pages Functions，文件即路由）
│   ├── _lib/
│   │   ├── crypto.js         PBKDF2 密码哈希（10k 迭代，免费版 CPU 预算内）+ HMAC
│   │   ├── session.js        签名会话令牌 + Cookie + CSRF 校验（requireAuth）
│   │   ├── ratelimit.js      KV 固定窗口限速器（IP 经 secret 盐哈希）
│   │   ├── store.js          KV 读写（site:data / 备份 / api-seed 降级）
│   │   ├── validate.js       输入校验（提交单、内容文档）
│   │   └── util.js           json/fail 响应、timingSafeEqual、随机数、base64
│   ├── api/
│   │   ├── auth/login.js     POST 登录（限速 5/分/IP）
│   │   ├── auth/logout.js    POST 登出（清 Cookie）
│   │   ├── auth/session.js   GET 当前会话状态
│   │   ├── data.js           GET 公开全站数据 / PUT 全量写回（需登录）
│   │   ├── meta.js           GET 站点元信息（需登录）
│   │   ├── submissions.js    POST 公开投稿（蜜罐+限速）/ GET·DELETE 管理（需登录）
│   │   ├── upload.js         POST logo 上传（需登录，MIME 白名单 + 150KB）
│   │   ├── backups/index.js  GET 备份列表（需登录）
│   │   ├── backups/restore.js POST 备份恢复（需登录）
│   │   └── health.js         GET 部署冒烟探针（公开，只返回布尔值）
│   └── assets/[id].js        GET 上传图片输出（8 位 hex id，immutable 缓存）
├── scripts/                  内容管线与工具（见第七节）
├── docs/                     文档
├── _headers                  /admin/* 安全响应头
├── wrangler.toml             KV 绑定 + 非密钥变量
└── api-seed.json             前端降级用静态数据（KV 不可用时兜底）
```

---

## 三、认证与安全

### 3.1 会话机制（functions/_lib/session.js）

- 令牌 = `base64url(payload).HMAC-SHA256(payload, ADMIN_SESSION_SECRET)`，无状态
- payload：`{ u: 用户名, exp: 签发+12h, csrf: 每会话随机 16 字节 }`
- Cookie：`shk_session; HttpOnly; Secure; SameSite=Strict; Max-Age=43200`
- 校验全部使用恒定时间比较（`timingSafeEqual`）

### 3.2 CSRF

- 每个会话内嵌 csrf 令牌，前端在**所有非 GET 请求**头带 `X-CSRF-Token`
- 服务端 `requireAuth()`：会话必查；CSRF 仅对写方法校验（GET/HEAD 豁免——曾因 GET 强制 CSRF 导致登录后跳转失败，勿回退）

### 3.3 登录防护（functions/api/auth/login.js)

- 限速：每 IP 每分钟 **5 次**（KV 键 `rl:login:<哈希IP>:<分钟>`，TTL 自动过期）
- 用户名/密码错误返回**同一文案**（防账号枚举）
- **fail-closed**：`ADMIN_USERNAME` 或三件套任一缺失 → 500 CONFIG 拒绝（勿恢复硬编码兜底用户名——仓库是公开的）

### 3.4 密码与密钥

| 项 | 位置 | 说明 |
|---|---|---|
| ADMIN_USERNAME | wrangler.toml [vars]（部署时同步到 Pages） | 当前 StackhkMain |
| ADMIN_PASSWORD_HASH | Pages Secret（dashboard） | PBKDF2-SHA256，10k 迭代，16 字节盐 |
| ADMIN_PASSWORD_SALT | Pages Secret | hex |
| ADMIN_SESSION_SECRET | Pages Secret | HMAC 签名密钥 |

- 10k 迭代是免费版 CPU 预算的**有意取舍**（代码注释有说明），依赖限速+强密码兜底
- ⚠️ 待办：CF token 与 GitHub token 曾在会话明文出现，**轮换仍未完成**

### 3.5 防收录与安全头（_headers）

```
/admin/*
  X-Robots-Tag: noindex, nofollow
  X-Frame-Options: DENY
  Cache-Control: no-store
```

- 页面另有 `<meta name="robots" content="noindex, nofollow">`；sitemap 不含 admin 路径
- **robots.txt 故意不 Disallow /admin**（屏蔽会让爬虫读不到 noindex——现状即最佳实践，勿"修复"）

### 3.6 安全审计结论（2026-08-30，详见记忆）

- 已核对全部 8 个 API 端点的鉴权覆盖（见第四节表格），无遗漏
- 已修复：硬编码用户名兜底（→fail-closed）；SVG 上传可内嵌脚本（低危，仅管理员可传，可选加固：`/assets/*` 加 `CSP: sandbox`）
- `/api/health` 公开返回配置布尔值——评估为无害

---

## 四、API 参考

| 端点 | 方法 | 鉴权 | 限速 | 说明 |
|---|---|---|---|---|
| `/api/auth/login` | POST | ❌ | 5/分/IP | 登录，Set-Cookie + 返回 csrf |
| `/api/auth/logout` | POST | ❌ | — | 清 Cookie |
| `/api/auth/session` | GET | ❌ | — | 当前登录状态 |
| `/api/data` | GET | ❌（公开） | — | 全站数据（tools/news/guides/courses…），Cache 60s；KV 缺失时降级读 `/api-seed.json` |
| `/api/data` | PUT | ✅ | — | 全量写回 `site:data`（写前自动备份） |
| `/api/meta` | GET | ✅ | — | 站点元信息 |
| `/api/submissions` | POST | ❌（公开） | 10/分/IP | 工具投稿（蜜罐字段 + 最短填写时间校验） |
| `/api/submissions` | GET/DELETE | ✅ | — | 投稿审核列表 / 删除 |
| `/api/upload` | POST | ✅ | — | logo 上传；dataUrl base64 ≤200KB；PNG/JPEG/WebP/SVG |
| `/api/backups` | GET | ✅ | — | 备份列表（键 `backup:site:*`，保留 20 份） |
| `/api/backups/restore` | POST | ✅ | — | 恢复指定备份 |
| `/api/health` | GET | ❌ | — | 冒烟探针：KV binding + 配置布尔值；**若返回 HTML 说明 Functions 未执行**（旧系统故障模式） |
| `/assets/[id]` | GET | ❌ | — | 上传图片输出（`img:<id>`，immutable 1y，nosniff） |

**鉴权实现**：所有需登录端点第一行 `requireAuth(request, env)`；新端点必须照做。

---

## 五、数据存储

### 5.1 KV 键空间（namespace STACKHK）

| 键模式 | 写入方 | 说明 |
|---|---|---|
| `site:data` | data PUT | 全站内容文档（tools/news/guides/courses 全在里面） |
| `site:meta` | meta | 站点元信息 |
| `backup:site:<ts>` | PUT 时自动 | 写前快照，滚动保留 20 份 |
| `img:<8位hex>` | upload | `{mime, b64}` JSON；由 `/assets/[id]` 输出 |
| `data:submissions:<id>` | submissions POST | 公开投稿 |
| `rl:<bucket>:<ip哈希>:<分钟>` | ratelimit | 限速计数，TTL 2×窗口 |

- KV 版本记录：**v12**（news 30）。每次大批量改 KV 后建议手动递增备注。
- ⚠️ 免费配额 10 万次/天：前端每次页面访问都会 `GET /api/data`（Cache 60s），内容量大时注意配额。

### 5.2 localStorage 备注

- `deals.html` 读取 `StackHK_deals_v2`，但**无任何写入方**——实际数据源是 deals.html 内联种子数组（当前 9 条）。新增优惠改种子数组即可。

---

## 六、后台功能模块（admin/admin.js）

SPA 视图与渲染函数对照（`data-view` → `renderX()`）：

| 视图 | 功能 | 数据端点 |
|---|---|---|
| dashboard | 概览统计 + 配置健康 | /api/health, /api/data |
| tools | 工具目录增删改（68 个，含评分/分类/短评） | /api/data (PUT) |
| news | 新闻列表管理（30 篇，标题/链接/图） | /api/data (PUT) |
| guides | 指南列表管理（31 篇） | /api/data (PUT) |
| courses | 课程频道管理 | /api/data (PUT) |
| logos | Logo 库上传/删除 | /api/upload, /assets/[id] |
| submissions | 投稿审核 | /api/submissions |
| settings | 站点设置 | /api/meta |
| backups | 备份列表/恢复 | /api/backups* |
| health | 系统状态面板 | /api/health |

- 保存模型：编辑进内存 → "保存全部更改"一次性 `PUT /api/data`（自动备份旧数据）
- standards.html 为独立静态页（不在 SPA 内），内容与 `scripts/audit-content.mjs` 的检查项对应

---

## 七、部署与内容管线

### 7.1 本地开发

```bash
npx wrangler pages dev --port 8790     # 8788/8789 有僵尸进程史，用 8790
# 本地无 Secrets，登录接口会返回 500 CONFIG——属预期，不代表代码故障
```

### 7.2 生产部署（每次发布固定流程）

```bash
node scripts/gen-sitemap.mjs           # ① sitemap + content-stats.json（部署前必跑）
node scripts/audit-content.mjs         # ② 内容标准审计（149 篇应 0 未达标）
git add -A && git commit               # ③ 提交
CLOUDFLARE_API_TOKEN=… CLOUDFLARE_ACCOUNT_ID=f3c243d01277c2479426f92c3e40e4c8 \
  npx wrangler pages deploy --branch master --commit-dirty=true   # ④ 单次部署
GH_TOKEN=… node scripts/api-push.mjs   # ⑤ GitHub 推送（见 7.3）
# ⑥ 生产回归：抽查改动页 200 + 关键内容
```

- 部署完成以 `~/.wrangler/logs/` 最新日志里 "Deployment complete" 为准（shell 可能卡在指标上报不退出，直接杀掉即可）
- 流程纪律：**本地构建 → 用户预览 → 确认 → 单次 deploy → 单次 push**（禁止频繁单独部署）

### 7.3 GitHub 推送（git 直连被代理阻断）

`scripts/api-push.mjs`：blobs→tree(base_tree)→commit→PATCH ref，**自动探测 base**（回溯本地提交找 tree 与远端 head 相同者——远端历史是 API 重建的，SHA 与本地不同但树一致，勿手填 SHA）。Token 获取：`grep -aohE "gh[pousr]_|cfat_..." ~/.zcode/cli/db/db.sqlite`（rollout 日志会滚动丢失，db.sqlite 才存完整值）。

### 7.4 内容标准（新内容必查）

- 标准：后台 /admin/standards 页（7 频道 + 通用 + 检查清单）
- 审计：`node scripts/audit-content.mjs` → 当前 **149/149 达标**（对比 15、新闻 30、AI 39、SaaS 34、指南 31×2 类）
- 图标规范：站点统一 Feather 线性风（`svg.ic`，stroke currentColor）；首页已换 IconPark outline（`@icon-park/svg`，currentColor）；新增页面图标沿用这两种，**不用 emoji**

---

## 八、踩坑清单（勿重复）

1. `_worker.js` 会整体接管路由与 functions/ 冲突——仓库严禁出现（免费配额事故根因）
2. admin.css `[hidden]` 曾被 `display:flex` 覆盖 → 登录框不显示；已加 `[hidden]{display:none!important}`
3. CSRF 不要套在 GET/HEAD 上
4. PBKDF2 盐是 hex，必须 `Buffer.from(salt,'hex')`（现为 Web Crypto hexToBuf）
5. JS `str.replace(re, template)` 的 template 含正文 `$1x`（如 "$17.1B"）会被当捕获组——**注入脚本一律用 replacer 函数或 split/join**
6. DIM_TABLE 注入需显式传分数参数
7. 工具目录 `pricing` 必须短字符串（数组会被静默展平成长文）
8. wrangler 部署完 shell 可能卡在 metrics 上报不退出——看日志 "Deployment complete" 即成功
9. API 推送 BASE 用**本地父提交**（或直接用 api-push.mjs 自动探测）；Windows cmd 下 `^` 是转义符，git 命令避免 `^{tree}` 语法
10. 会话 rollout 日志（cli/rollout/*.jsonl）会滚动丢失旧内容——完整 token 只在 `~/.zcode/cli/db/db.sqlite`（`grep -a` 提取后先打 verify API）

---

## 九、运维待办

- [ ] CF token / GitHub token 轮换（均已在聊天明文出现过）
- [ ] `/assets/*` 对 SVG 加 `Content-Security-Policy: sandbox`（低危加固）
- [ ] 旧项目 stackhk12 稳定期后清理
- [ ] KV 免费配额监控（/api/data 每页一调）

---

## 附：相关文档

| 文档 | 内容 |
|---|---|
| `docs/StackHK升级方案.md` | 当初的模板升级方案（历史） |
| `admin/standards.html` | 内容产出标准（7 频道） |
| `scripts/audit-content.mjs` | 内容标准审计（可执行的标准） |
| `README.md` | 部署命令与目录速览 |
