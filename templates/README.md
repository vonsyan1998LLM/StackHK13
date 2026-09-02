# 模板体系（WIP - 基建阶段）

> 按你的要求：先搭建基建，**暂不生成具体页面模板**（等你逐页选型）

## 已完成基建

- `partials/header.html` / `footer.html` — 以 `js/site.js` 为唯一真源抽离（Nunjucks，`{{ prefix }}`/`{{ page }}` 变量，active 高亮，mobile-menu 由 `tp-nav.js` 驱动）
- `partials/head.html` — 通用 head（title/description/canonical/OG/字体/css/favicon）
- `partials/scripts.html` — 按 `page` 类型分流加载 `tp-main.js` vs `main.js` + 统一 `tp-nav.js`（解决 `getBasePath` 缺 `saas/news/articles/weekly` 与 `hamburger` vs `menu-btn` 事件分叉）
- `layouts/base.html` — 骨架：`head + header + {% block content %} + footer + scripts`
- `templates/header.html` / `footer.html` 旧文件已保留（待后续归档，`robots.txt` 的 `Disallow: /templates/` 建议移除）

## 待你选型后再生成

以下页面类型**已列出但未生成模板**，等你确认每类用何种版式再批量生成：

| 类型 | 示例 | 当前用法 | 待选 |
|------|------|----------|------|
| 首页 | `index.html` | `tp.css` + `tp-main.js` + hero-type | - |
| 聚合频道 | `reviews.html` `tools.html` `saas.html` `categories.html` | 纯 `tp-main.js` 数据驱动 | - |
| 频道分类 | `categories/writing.html` | `#cat-grid` + `data-cats` | - |
| 子详情 | `reviews/*.html` `saas/*.html` (78篇) | 双CSS + `main.js` + 内联 `.review-page` | - |
| 文章 | `articles/*.html` (35篇) | 双CSS + `.article-page` | - |
| 新闻 | `news/*.html` (40篇) | 仅 `tp.css` + `site.js` | - |
| 对比 | `compare/*.html` (16篇) | 双CSS + 内联对比表 | - |
| 周刊 | `weekly/*.html` (4篇) | 双CSS + `.issue-page` | - |
| 静态页 | `about.html` `legal.html` etc | 双CSS | - |

下一步：你逐个指定
- 首页是否保留 `tp.css` 单轨还是合并 `style.css` 的 `.hero` 两栏
- 详情页是否保留内联 `review-page` 样式还是抽离为 `css/review.css`
- 频道页是否保留 `data-prefix` 自动计算

确认后执行 `scripts/build.js` 统一渲染 → 输出到 `dist/` → `wrangler pages deploy`
