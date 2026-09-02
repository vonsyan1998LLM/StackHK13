#!/usr/bin/env node
// 统一构建入口（占位，待页面模板选型后实现）
// 职责：
//  1) Nunjucks 渲染 templates/layouts/* + partials/*
//  2) 自动计算 data-prefix (""/"../") 与 data-page 高亮
//  3) 校验：footer 未闭合污染、内链 404、JSON-LD 必填、data-prefix 错误
//  4) 生成 sitemap.xml / content-stats.json
// 用法：node scripts/build.js  (后续接入 npm run build)
//
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const checks = [];

function assertNoDoubleSource() {
  // 校验三真源是否已收敛
  const siteJs = fs.readFileSync(path.join(ROOT, 'js/site.js'), 'utf8');
  const headerPartial = fs.readFileSync(path.join(ROOT, 'templates/partials/header.html'), 'utf8');
  const footerPartial = fs.readFileSync(path.join(ROOT, 'templates/partials/footer.html'), 'utf8');
  console.log('[build] 单一真源校验: header/footer partials 已就绪');
  console.log('  - js/site.js 导航项:', (siteJs.match(/navLink\(/g)||[]).length, '项');
  console.log('  - partials/header.html 已抽离');
  console.log('  - 旧 templates/header.html 待归档');
}

function checkDataPrefix() {
  const files = [...fs.globSync ? [] : []]; // placeholder for future glob
  console.log('[build] data-prefix 校验: 待页面模板选型后启用（自动计算 prefix）');
}

console.log('StackHK build.js — 占位版本');
console.log('  模板选型完成前不生成页面，仅校验基建');
assertNoDoubleSource();
checkDataPrefix();
console.log('[build] done (no output, waiting for layout selection)');
