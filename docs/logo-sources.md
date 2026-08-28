# StackHK Logo 来源与补全指南

> Logo 注册表位置：`SEED.logos`（`functions/_data/seed.js`，经 KV 同步）。管理入口：`/admin/` → 🖼️ Logo 库。
> 规范：`/images/logos/<tool-id>.svg`（优先 SVG；品牌官方 SVG 优先于 PNG）。

## 来源 1（主用）：thesvg.org — The Open SVG Brand Library

- 网站：https://thesvg.org （开源：https://github.com/GLINCKER/thesvg）
- 批量方式（推荐）：npm 包 `@thesvg/icons`
  - 文件列表：`https://data.jsdelivr.com/v1/packages/npm/@thesvg/icons@<ver>?structure=flat`
  - 单个图标：`https://cdn.jsdelivr.net/npm/@thesvg/icons@<ver>/dist/<slug>.cjs`
  - SVG 提取：从 cjs 源码正则抽 `<svg …</svg>`（模块导出 slug/title/hex/svg 字符串）
- 2026-08-28 已用它为 **38 个工具**升级/补全（PNG→SVG 13、新增 3、覆盖刷新 22）

## 来源 2（补全用）：ailogocollection.com — Free AI Company Logo Collection

- 网站：https://ailogocollection.com/ （320+ AI 公司，SVG+PNG，免费、无需注册、无需署名）
- 页面：`https://ailogocollection.com/logos/<slug>`（如 `/logos/gamma`、`/logos/heygen`）
- **直链规律**（页面 HTML 内含 Supabase 公开存储链接）：
  - Logomark（纯图标）：`https://ngccgynpmxypswzjxnpx.supabase.co/storage/v1/object/public/logo-submissions/<slug>/<slug>-logomark-light.svg`
  - Wordmark：`…/<slug>-logo-light.svg`
  - 明/暗变体：`-light` / `-dark`
- 用途：thesvg.org 找不到、或现有 logo 不是 SVG 时，来这里补全。

## 2026-08-28 thesvg 未命中清单（→ ailogocollection 可补全）

| 工具 | ailogocollection 页面 |
|---|---|
| gamma | /logos/gamma ✅ |
| heygen | /logos/heygen ✅ |
| synthesia | /logos/synthesia ✅ |
| jasper | /logos/jasper ✅ |
| clay | /logos/clay ✅ |
| leonardo-ai | /logos/leonardo-ai ✅ |
| sora | 站内无独立页（有 Pika/Runway；Sora 需另行来源） |
| getresponse / apollo / deel / gorgias / omnisend / activecampaign | 站内无（非 AI-native 品牌，现有 PNG 可用） |
| voiceappear / julius-ai | 站内无（小众工具；voiceappear 已有自绘 SVG） |

## 当前遗留（低优先）

- 仍为 PNG 的工具（ailogocollection 无收录，保持现状）：`adobe-firefly.png`、`apollo.png`、`getresponse.png`
- 占位徽章：`prowritingaid.svg`（首字母 P，thesvg/ailogocollection 均未收录；后续找到官方标再替换）
- 别名冗余文件（未被引用，可留作历史）：`claude.png`、`cursor.png`、`midjourney.svg`、`clickup.svg`

## 补全流程（以后照此执行）

1. 在 thesvg.org（或 npm `@thesvg/icons`）搜 `<brand>`
2. 找不到 → 打开 `https://ailogocollection.com/logos/<brand>`，从页面 HTML 取 Supabase SVG 直链下载（优先 `-logomark-light.svg`）
3. 保存为 `images/logos/<tool-id>.svg`
4. 更新 `SEED.logos` 对应条目（file/format/status/note 注明来源）+ `api-seed.json`
5. 后台「保存全部修改」或直接部署
