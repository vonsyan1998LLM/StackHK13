# StackHK × ToolPulse 模板升级方案

> 目标：用 `D:\web\toolpulse-site` 动态模板升级 airecmark.com，**保留 StackHK 全部内容与 SEO 资产**，获得工具目录、新闻流、排行榜、后台管理能力。

---

## 一、升级原则（不可违反）

1. **内容零丢失** — 81 个内容详情页（39 AI 评测 + 19 SaaS + 17 文章 + 6 对比）全部原样保留
2. **SEO 资产零损失** — sitemap.xml、llms.txt、JSON-LD、canonical、GSC/Bing 收录、IndexNow 全部延续
3. **URL 不变** — 所有现有页面路径保持原样（`/reviews/claude-pro.html` 等），已收录页面不做 301
4. **品牌统一** — 全站替换为 StackHK 品牌，域名 airecmark.com

---

## 二、现状盘点

### StackHK 内容资产（必须保留）
| 资产 | 数量 | 说明 |
|---|---|---|
| AI 工具评测 | 39 页 | 含 Review/FAQPage/Breadcrumb JSON-LD、评分细分、Pros/Cons |
| SaaS 评测 | 19 页 | 同上结构 |
| 文章/指南 | 17 页 | 榜单 11 + 对比指南 6 |
| 对比页 | 6 页 | compare/ 目录 |
| 索引/信息页 | 15 页 | reviews/saas/articles/categories/deals/weekly/search/about/contact/privacy/terms/disclosure/submit |
| SEO 资产 | — | sitemap(102 URL)、llms.txt、robots.txt(13 AI 爬虫)、IndexNow Action、Bing/GSC 已验证 |
| 品牌元素 | — | logo.svg、logo-white.svg、金色 #F5A623 主题、Playfair+DM Sans 字体 |

### ToolPulse 模板能力（升级目标）
| 能力 | 说明 |
|---|---|
| 动态数据 | KV 存储 + `/api/data` 接口，前台 JS 渲染，静态兜底 |
| 后台管理 | `/admin/` 密码登录，可视化管理工具/新闻/课程/文案/用户提交 |
| 工具目录 | tools.html：32+ 工具，搜索 + 分类筛选实时过滤 |
| Top 20 榜单 | ranking.html：双栏排名 + 奖牌 |
| 新闻流 | news.html + 首页新闻区（5 类标签：发布/政策/产品/公司/研究） |
| 课程频道 | courses 区块（可保留或改造为「指南」） |
| 用户提交 | submissions API + 后台审核 |
| 页面生成器 | scripts/gen-pages.mjs 一键生成内页 |

---

## 三、品牌融合方案

| 项目 | ToolPulse 现值 | 改为 StackHK |
|---|---|---|
| 站名 | ToolPulse | **StackHK** |
| Logo mark | "T" 渐变方块 | "S" 渐变方块（复用现有 logo.svg 或文字 mark） |
| 主色 | indigo #4F46E5 / violet #7C3AED / cyan #0891B2 | **保留模板配色**（与 StackHK 金色系差异大；建议以模板蓝紫为主、金色 #F5A623 做评分星/徽章点缀，形成品牌记忆点） |
| Hero 文案 | "Your daily pulse on AI…" | "Independent AI tool & SaaS reviews, tested by real teams"（沿用 StackHK 定位语） |
| Footer 描述 | "world's leading AI discovery platform" | "Hong Kong's independent source for honest AI tool & B2B SaaS reviews" |
| 联系方式 | — | admin@airecmark.com、香港地址（沿用现有 footer） |
| 字体 | 系统字体 | 可保留（性能更好），标题可选配 Playfair Display 呼应旧版 |
| 域名 | — | airecmark.com（部署到现有域名） |

---

## 四、数据模型升级（seed.js 扩展）

模板现有字段不够表达 StackHK 评测深度，扩展如下：

```js
// 现有字段
{ id, name, icon, category, score, vendor, tier, pricing, featured, desc }

// 新增字段（迁移时填充）
{
  reviewUrl: "reviews/claude-pro.html",   // ★ 指向现有详情页（关键！）
  slug: "claude-pro",                      // 分类页聚合用
  scores: { features:9.2, performance:9.6, ease:9.3, value:8.8, support:9.0 },
  pros: ["…","…"], cons: ["…","…"],
  freeTrial: true,
  updated: "2026-08-21",
  editorPick: "Editor's Choice"            // 徽章文案（可空）
}
```

**分类映射**（StackHK → 模板 category 枚举）：
- 写作 → `chat`（或新增 `writing`）
- 编码 → `code`
- 生产力 → `productivity`
- 图像/视频 → `image` / `video`
- 音频 → `audio`
- 商业 → `business`
- SaaS 19 个 → `business` / 新增 `saas` 类别

**数据来源**：从 `llms.txt` 提取全部 58 个工具的名称/类别/评分（已是结构化表格），从各评测页提取 desc/pros/cons（可脚本化解析）。

---

## 五、页面规划

### 保留不动（内容资产）
- `reviews/*.html`（39）、`saas/*.html`（19）、`articles/*.html`（17）、`compare/*.html`（6）
- `about/contact/privacy/terms/disclosure/submit.html`（沿用旧版或用模板壳重排，二选一）
- `css/style.css`（旧版样式，详情页仍依赖）、`js/main.js`（旧版）

### 用模板替换/新增（新壳）
| 页面 | 动作 | 说明 |
|---|---|---|
| `index.html` | **替换** | 模板主页：hero + 精选工具 + 新闻流 + Top 榜 + 订阅 |
| `tools.html` | **新增** | 全量工具目录（搜索/筛选），卡片链接到现有评测页 |
| `news.html` | **新增** | AI 新闻归档（后台可维护） |
| `ranking.html` | **新增** | Top 20 排行榜 |
| `categories.html` + 6 分类页 | **替换** | 模板动态版（`data-cats` 聚合渲染） |
| `reviews.html` / `saas.html` | **替换壳** | 用模板 page-hero + 动态网格，保留路径 |
| `glossary.html` | 新增（可选） | 模板自带，AI 术语表对 SEO 有利 |
| `admin/` + `functions/` | **新增** | 后台 + API（admin 已 noindex） |

### 需要改造的模板点
1. **工具卡片加链接**：模板 `toolCard()` 渲染的是 `<div>`，需改为 `<a href="${t.reviewUrl}">`——这是打通目录→详情页的关键
2. **分类页聚合**：`data-cats` 过滤逻辑已支持，补 `reviewUrl` 链接即可
3. **新闻标签**：沿用模板 5 类标签
4. **课程区**：改为「购买指南」入口（复用 guides 数据，链到 articles/）
5. **gen-pages.mjs**：品牌替换后重跑，批量刷新内页壳

---

## 六、SEO 资产延续方案

| 资产 | 处理 |
|---|---|
| sitemap.xml | 更新：新增 tools/news/ranking/glossary URL，保留全部现有 URL |
| llms.txt | 更新：加入 tools.html、ranking.html、news.html |
| robots.txt | 不变（AI 爬虫放行已配好） |
| JSON-LD | 新页面补 WebSite/Organization；详情页原有 Review/FAQ 不动 |
| IndexNow | GitHub Action 继续工作（push 即提交） |
| GSC/Bing | 无需变更（URL 不变） |
| canonical | 新页面写新 canonical；旧页面不动 |
| admin/ | 保持 noindex,nofollow；functions/api/ 加 robots 禁抓 |

---

## 七、分阶段实施计划

### Phase 1 — 品牌替换 + 数据迁移（1 天）
1. 复制模板文件进 StackHK12 仓库（tools/news/ranking/glossary/admin/functions/js/css 按目录规划合并）
2. 全局替换品牌：ToolPulse→StackHK、"T"→"S"、footer 文案、联系方式
3. 重写 `seed.js`：58 个工具（含 reviewUrl/scores/pros/cons）+ 精选新闻 + guides 指向现有 articles
4. 改造 `toolCard()` 输出 `<a>` 链接 + 金色评分星

### Phase 2 — 页面整合（1 天）
5. 用模板壳重做 `index.html`（保留旧版备份 index.backup）
6. 重做 `reviews.html`/`saas.html`/`categories.html`+6 分类页（动态渲染 + 保留路径）
7. 新增 `tools.html`/`news.html`/`ranking.html`/`glossary.html`
8. 更新全站导航（新旧页面互链一致）

### Phase 3 — 后端 + 后台（半天）
9. 部署 functions/ + 创建 KV + 绑定
10. 设置 ADMIN_PASSWORD secret
11. 后台录入首批 AI 新闻（10 条）

### Phase 4 — SEO 收尾 + 上线（半天）
12. 更新 sitemap.xml / llms.txt / robots.txt
13. 本地全页面回归（链接、渲染、JSON-LD 校验）
14. push → Pages 部署 → IndexNow 自动提交
15. GSC 提交新增 URL；线上冒烟测试

**总工期：约 3 个工作日**

---

## 八、风险与回滚

| 风险 | 缓解 |
|---|---|
| 新主页替换影响转化/SEO | 旧 index.html 保留为 backup；可随时回滚 |
| KV 未配置导致前台空白 | 模板自带静态兜底，接口失败不白屏 |
| 详情页样式与新壳不一致 | Phase 2 保持详情页旧样式不动；Phase 后期可选统一 |
| admin 弱密码风险 | 强密码 + 12h token 已内置；可加 Cloudflare Access |
| 双 CSS 冲突 | 模板样式独立文件（css/style.css 承载新壳），详情页继续用旧 css/，互不干扰 |

---

## 九、升级后收益

1. **内容可运营**：新闻/工具/文案后台可视化维护，不再改代码发内容
2. **目录级入口**：tools.html 可搜索筛选 58+ 工具，提升页面数与内链密度（SEO）
3. **Top 20 榜单**：高转化落地页，适合「best AI tools」类关键词
4. **新闻频道**：持续更新的 AI news 抓 AI 爬虫与新闻收录
5. **用户提交**：工具提交流程自动化（submit → 后台审核 → 上架）
6. **全部旧资产保留**：81 个详情页 + 全部 SEO 信号无缝延续


---

## Compare 子页横幅模板（.vs-hero）

compare/ 目录下所有对比详情页的顶部横幅统一使用 tp.css 中的模板类 `.vs-hero`：

- 背景：明亮温馨的 VS 主题图 `images/compare-vs-bg.jpg` + 白色半透明遮罩（68%→78%）
- 标题：`.vs-hero h2`（深色 #1A1C22）
- 描述：`.vs-hero .vs-desc`（#4A4E58）

**新增对比页时**：复制现有子页（如 compare/chatgpt-vs-gemini.html）作为模板，横幅区使用：
`<div class="vs-hero">…<h2>标题</h2><p class="vs-desc">描述</p></div>`
即可自动获得统一背景，无需内联样式。
