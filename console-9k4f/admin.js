/* StackHK Admin SPA — vanilla ES module, no framework.
   Talks to same-origin /api/* with HttpOnly session cookie + CSRF header. */

const CATS = [
  ['chat', 'Chat & Writing'], ['code', 'Coding'], ['productivity', 'Productivity'],
  ['image', 'Image Gen'], ['video', 'Video'], ['audio', 'Audio & Voice'],
  ['marketing', 'Marketing'], ['business', 'Business AI']
];
const TAGS = [
  ['release', 'Model Release'], ['policy', 'Policy & Governance'],
  ['products', 'Tools & Products'], ['business', 'Company News'], ['research', 'Research']
];
const GROUPS = [['ai', 'AI 工具'], ['saas', 'SaaS']];
const TIERS = [['free', 'Free'], ['freemium', 'Freemium'], ['paid', 'Paid']];

const state = {
  csrf: null,
  captchaId: null,
  username: null,
  data: null,
  meta: null,
  health: null,
  submissions: [],
  dirty: false,
  view: 'dashboard',
  toolFilter: { q: '', cat: 'all' }
};

/* ---------------- api ---------------- */

async function api(path, opts = {}) {
  const headers = { accept: 'application/json', ...(opts.headers || {}) };
  if (opts.body) headers['Content-Type'] = 'application/json';
  if (state.csrf && opts.method && opts.method !== 'GET') headers['X-CSRF-Token'] = state.csrf;
  const res = await fetch(path, { ...opts, headers, credentials: 'same-origin' });
  if (res.status === 401 && !path.startsWith('/api/auth')) {
    showLogin();
    throw new Error('会话已过期，请重新登录');
  }
  let body = null;
  try { body = await res.json(); } catch (e) { /* non-JSON */ }
  if (!res.ok) {
    const msg = body && body.error ? body.error.message : `请求失败 (HTTP ${res.status})`;
    throw new Error(msg);
  }
  return body;
}

/* ---------------- helpers ---------------- */

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function toast(msg, isErr = false) {
  const el = $('#toast');
  el.textContent = msg;
  el.className = isErr ? 'err' : '';
  el.hidden = false;
  clearTimeout(toast._t);
  toast._t = setTimeout(() => { el.hidden = true; }, 2600);
}

function catLabel(v) { const c = CATS.find(x => x[0] === v); return c ? c[1] : (v || '—'); }
function tagLabel(v) { const t = TAGS.find(x => x[0] === v); return t ? t[1] : (v || '—'); }

function openModal(html) {
  const box = $('#modal-box');
  box.innerHTML = html;
  $('#modal-mask').hidden = false;
  return box;
}
function closeModal() {
  $('#modal-mask').hidden = true;
  $('#modal-box').innerHTML = '';
}
function confirmModal(text, onYes) {
  openModal(`
    <h2>确认操作</h2><p class="muted">${esc(text)}</p>
    <div class="modal-actions">
      <button class="btn" data-act="cancel">取消</button>
      <button class="btn btn-primary" data-act="yes">确认</button>
    </div>`);
  $('[data-act="cancel"]').onclick = closeModal;
  $('[data-act="yes"]').onclick = () => { closeModal(); onYes(); };
}

/* ---------------- auth ---------------- */

function showLogin() {
  $('#app-view').hidden = true;
  $('#login-view').hidden = false;
  $('#login-password').value = '';
  $('#login-captcha').value = '';
  loadCaptcha();
}

async function loadCaptcha() {
  const box = $('#captcha-img');
  if (!box) return;
  try {
    const r = await fetch('/api/auth/captcha', { credentials: 'same-origin' });
    const j = await r.json();
    if (!r.ok || !j.id) throw new Error(j.error && j.error.message ? j.error.message : 'load failed');
    state.captchaId = j.id;
    box.innerHTML = j.svg;
  } catch (e) {
    box.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;font-size:.72rem;color:var(--muted)">加载失败 · 点击重试</div>';
  }
}

async function enterApp() {
  $('#login-view').hidden = true;
  $('#app-view').hidden = false;
  $('#side-user').textContent = state.username;
  const [data, health] = await Promise.all([api('/api/data'), api('/api/health')]);
  state.data = data;
  state.health = health;
  await refreshMeta();
  try {
    const subs = await api('/api/submissions');
    state.submissions = subs.items || [];
  } catch (e) { state.submissions = []; }
  setDirty(false);
  navigate(location.hash.replace('#', '') || 'dashboard');
}

async function refreshMeta() {
  try {
    state.meta = await api('/api/meta');
  } catch (e) {
    state.meta = null;
  }
}

$('#login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = $('#login-btn');
  btn.disabled = true;
  $('#login-error').hidden = true;
  try {
    const r = await api('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        username: $('#login-username').value.trim(),
        password: $('#login-password').value,
        captchaId: state.captchaId,
        captchaText: $('#login-captcha').value
      })
    });
    state.csrf = r.csrf;
    state.username = r.user.username;
    await enterApp();
  } catch (err) {
    $('#login-error').textContent = err.message;
    $('#login-error').hidden = false;
    loadCaptcha();
  } finally {
    btn.disabled = false;
  }
});

$('#logout-btn').addEventListener('click', async () => {
  try { await api('/api/auth/logout', { method: 'POST' }); } catch (e) { /* ignore */ }
  state.csrf = null;
  showLogin();
});

/* ---------------- dirty / save ---------------- */

function setDirty(v) {
  state.dirty = v;
  $('#save-btn').disabled = !v;
  $('#save-state').textContent = v
    ? '● 有未保存更改'
    : (state.meta ? `已保存 v${state.meta.version} · ${state.meta.at ? new Date(state.meta.at).toLocaleString() : ''}` : '');
}

$('#save-btn').addEventListener('click', async () => {
  const btn = $('#save-btn');
  btn.disabled = true;
  btn.textContent = '保存中…';
  try {
    const r = await api('/api/data', { method: 'PUT', body: JSON.stringify(state.data) });
    await refreshMeta();
    setDirty(false);
    toast(`已保存（版本 v${r.version}）`);
  } catch (e) {
    toast(e.message, true);
    btn.disabled = false;
  } finally {
    btn.textContent = '保存全部更改';
  }
});

window.addEventListener('beforeunload', (e) => {
  if (state.dirty) { e.preventDefault(); e.returnValue = ''; }
});

/* ---------------- navigation ---------------- */

const VIEW_TITLES = {
  dashboard: '仪表盘', tools: '工具管理', news: '新闻管理', guides: '购买指南',
  courses: '课程频道', logos: 'Logo 库', submissions: '提交审核',
  settings: '站点设置', backups: '备份恢复', health: '系统状态'
};

function navigate(view) {
  state.view = view;
  location.hash = view;
  $$('#side-nav a').forEach(a => a.classList.toggle('active', a.dataset.view === view));
  $('#view-title').textContent = VIEW_TITLES[view] || view;
  const renderers = {
    dashboard: renderDashboard, tools: renderTools, news: renderNews, guides: renderGuides,
    courses: renderCourses, logos: renderLogos, submissions: renderSubmissions,
    settings: renderSettings, backups: renderBackups, health: renderHealth
  };
  updateNavCounts();
  (renderers[view] || renderDashboard)();
}

$$('#side-nav a').forEach(a => a.addEventListener('click', () => navigate(a.dataset.view)));
window.addEventListener('hashchange', () => {
  const v = location.hash.replace('#', '');
  if (v && v !== state.view) navigate(v);
});

function updateNavCounts() {
  const d = state.data;
  $('#nav-tools-count').textContent = d.tools.length;
  $('#nav-news-count').textContent = d.news.length;
  $('#nav-guides-count').textContent = d.guides.length;
  $('#nav-courses-count').textContent = d.courses.length;
  $('#nav-logos-count').textContent = d.logos.length;
  $('#nav-subs-count').textContent = state.submissions.filter(s => s.status === 'pending').length;
}

/* ---------------- dashboard ---------------- */

function renderDashboard() {
  const d = state.data;
  const pending = state.submissions.filter(s => s.status === 'pending').length;
  const saasCount = d.tools.filter(t => t.group === 'saas').length;
  $('#content').innerHTML = `
    <div class="stat-grid">
      <div class="stat"><b>${d.tools.length}</b><span>工具（含 ${saasCount} 个 SaaS）</span></div>
      <div class="stat"><b>${d.news.length}</b><span>首页新闻</span></div>
      <div class="stat"><b>${d.guides.length}</b><span>购买指南</span></div>
      <div class="stat"><b>${d.logos.length}</b><span>Logo 库</span></div>
      <div class="stat"><b>${pending}</b><span>待审提交</span></div>
      <div class="stat"><b>${d.tools.filter(t => t.featured).length}</b><span>首页精选</span></div>
    </div>
    <div class="panel">
      <h2>系统状态</h2>
      ${healthHtml()}
    </div>
    <div class="panel">
      <h2>最近保存</h2>
      <p class="muted">${state.meta && state.meta.at
        ? `版本 v${state.meta.version} · ${esc(state.meta.by || '')} · ${new Date(state.meta.at).toLocaleString()}`
        : '尚无保存记录（当前数据来自 api-seed.json 兜底）'}</p>
      <p class="muted small" style="margin-top:.6rem">前台读取 <code>/api/data</code>，保存后即时生效（缓存 ≤60 秒）。</p>
    </div>`;
}

function healthHtml() {
  const h = state.health;
  if (!h) return '<p class="muted">无法获取</p>';
  const c = h.checks || {};
  const dot = v => `<span class="${v ? 'status-ok' : 'status-bad'}">${v ? '✓' : '✗ 缺失'}</span>`;
  return `<table class="table">
    <tr><td>KV 绑定 (STACKHK)</td><td>${c.kv === 'ok' ? '<span class="status-ok">✓ 正常</span>' : `<span class="status-bad">✗ ${esc(c.kv)}</span>`}</td></tr>
    <tr><td>ADMIN_USERNAME</td><td>${dot(c.adminUsername)}</td></tr>
    <tr><td>ADMIN_PASSWORD_SALT</td><td>${dot(c.passwordSalt)}</td></tr>
    <tr><td>ADMIN_PASSWORD_HASH</td><td>${dot(c.passwordHash)}</td></tr>
    <tr><td>ADMIN_SESSION_SECRET</td><td>${dot(c.sessionSecret)}</td></tr>
    <tr><td>服务版本</td><td class="muted">${esc(h.version)}</td></tr>
  </table>`;
}

/* ---------------- tools ---------------- */

function renderTools() {
  const { q, cat } = state.toolFilter;
  const list = state.data.tools
    .filter(t => cat === 'all' || t.category === cat)
    .filter(t => !q || `${t.name} ${t.vendor} ${t.desc}`.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => b.score - a.score);

  $('#content').innerHTML = `
    <div class="panel">
      <div class="toolbar">
        <input id="tool-q" placeholder="搜索工具…" value="${esc(q)}" style="width:220px">
        <select id="tool-cat">
          <option value="all">全部分类</option>
          ${CATS.map(([v, l]) => `<option value="${v}" ${cat === v ? 'selected' : ''}>${l}</option>`).join('')}
        </select>
        <span class="muted small">${list.length} / ${state.data.tools.length} 个工具</span>
        <span style="flex:1"></span>
        <button class="btn btn-primary" id="tool-add">+ 新增工具</button>
      </div>
      <table class="table">
        <thead><tr><th></th><th>名称</th><th>分类</th><th>评分</th><th>组</th><th>定价</th><th>精选</th><th class="actions">操作</th></tr></thead>
        <tbody>
          ${list.map(t => `
            <tr data-id="${esc(t.id)}">
              <td><img class="tool-icon" src="${esc(t.icon)}" alt="" onerror="this.style.visibility='hidden'"></td>
              <td><input class="name-input" data-field="name" value="${esc(t.name)}"></td>
              <td>
                <select data-field="category" style="width:130px">
                  ${CATS.map(([v, l]) => `<option value="${v}" ${t.category === v ? 'selected' : ''}>${l}</option>`).join('')}
                </select>
              </td>
              <td><input class="score-input" type="number" step="0.1" min="0" max="10" data-field="score" value="${t.score ?? ''}"></td>
              <td>
                <select data-field="group" style="width:90px">
                  ${GROUPS.map(([v, l]) => `<option value="${v}" ${t.group === v ? 'selected' : ''}>${l}</option>`).join('')}
                </select>
              </td>
              <td class="muted small">${esc(t.pricing || t.tier || '')}</td>
              <td><span class="pill ${t.featured ? 'on' : ''}" data-act="featured">${t.featured ? '精选' : '—'}</span></td>
              <td class="actions">
                <button class="btn btn-sm" data-act="edit">编辑</button>
                <button class="btn btn-sm btn-danger" data-act="del">删除</button>
              </td>
            </tr>`).join('') || '<tr><td colspan="8" class="empty">没有匹配的工具</td></tr>'}
        </tbody>
      </table>
      <p class="muted small" style="margin-top:.8rem">名称/分类/评分/组可就地编辑，改动需点右上角「保存全部更改」才会生效。</p>
    </div>`;

  $('#tool-q').addEventListener('input', e => { state.toolFilter.q = e.target.value; renderTools(); });
  $('#tool-cat').addEventListener('change', e => { state.toolFilter.cat = e.target.value; renderTools(); });
  $('#tool-add').addEventListener('click', () => toolEditor(null));

  $$('#content tbody tr').forEach(tr => {
    const tool = state.data.tools.find(t => t.id === tr.dataset.id);
    if (!tool) return;
    $$('[data-field]', tr).forEach(inp => {
      inp.addEventListener('change', () => {
        const f = inp.dataset.field;
        if (f === 'score') tool.score = Math.min(10, Math.max(0, Number(inp.value) || 0));
        else if (f === 'group') { tool.group = inp.value; if (inp.value === 'saas') tool.saas = true; else delete tool.saas; }
        else tool[f] = inp.value;
        setDirty(true);
        if (f === 'category' || f === 'group') renderTools();
      });
    });
    const feat = $('[data-act="featured"]', tr);
    feat.addEventListener('click', () => { tool.featured = !tool.featured; setDirty(true); renderTools(); });
    $('[data-act="edit"]', tr).addEventListener('click', () => toolEditor(tool));
    $('[data-act="del"]', tr).addEventListener('click', () =>
      confirmModal(`删除工具「${tool.name}」？保存后前台目录不再显示（详情静态页不受影响）。`, () => {
        state.data.tools = state.data.tools.filter(x => x.id !== tool.id);
        setDirty(true);
        renderTools();
      }));
  });
}

function toolEditor(tool) {
  const isNew = !tool;
  const t = tool ? { ...tool } : {
    id: 'tool-' + Date.now().toString(36), name: '', icon: '', category: 'chat', score: 0,
    vendor: '', tier: 'freemium', pricing: '', featured: false, group: 'ai', reviewUrl: '', desc: ''
  };
  const catOpts = CATS.map(([v, l]) => `<option value="${v}" ${t.category === v ? 'selected' : ''}>${l}</option>`).join('');
  const tierOpts = TIERS.map(([v, l]) => `<option value="${v}" ${t.tier === v ? 'selected' : ''}>${l}</option>`).join('');
  const groupOpts = GROUPS.map(([v, l]) => `<option value="${v}" ${t.group === v ? 'selected' : ''}>${l}</option>`).join('');
  const logoOpts = state.data.logos.map(l => `<option value="${esc(l.file)}" ${t.icon === l.file ? 'selected' : ''}>${esc(l.name)}</option>`).join('');

  const box = openModal(`
    <h2>${isNew ? '新增工具' : '编辑工具 · ' + esc(t.name)}</h2>
    <div class="row">
      <div class="field"><label>名称 *</label><input id="e-name" value="${esc(t.name)}"></div>
      <div class="field"><label>厂商 / 来源</label><input id="e-vendor" value="${esc(t.vendor || '')}"></div>
    </div>
    <div class="row">
      <div class="field"><label>分类</label><select id="e-category">${catOpts}</select></div>
      <div class="field"><label>组</label><select id="e-group">${groupOpts}</select></div>
      <div class="field"><label>定价档</label><select id="e-tier">${tierOpts}</select></div>
    </div>
    <div class="row">
      <div class="field"><label>评分 (0–10)</label><input id="e-score" type="number" step="0.1" min="0" max="10" value="${t.score}"></div>
      <div class="field"><label>定价文案</label><input id="e-pricing" value="${esc(t.pricing || '')}" placeholder="e.g. Free + $20/mo"></div>
      <div class="field checkbox" style="align-items:flex-end;padding-bottom:.4rem">
        <input type="checkbox" id="e-featured" ${t.featured ? 'checked' : ''}>
        <label for="e-featured">首页精选</label>
      </div>
    </div>
    <div class="field"><label>Logo / 图标</label>
      <div class="row">
        <select id="e-icon"><option value="">— 从 Logo 库选择 —</option>${logoOpts}</select>
        <input id="e-icon-url" value="${esc(t.icon || '')}" placeholder="或直接填图片 URL">
      </div>
    </div>
    <div class="field"><label>评测页链接 reviewUrl</label><input id="e-review" value="${esc(t.reviewUrl || '')}" placeholder="/reviews/xxx.html 或完整 URL"></div>
    <div class="field"><label>一句话描述</label><textarea id="e-desc" rows="2">${esc(t.desc || '')}</textarea></div>
    <div class="modal-actions">
      <button class="btn" data-act="cancel">取消</button>
      <button class="btn btn-primary" data-act="apply">${isNew ? '添加' : '应用'}</button>
    </div>`);

  $('#e-icon', box).addEventListener('change', e => { if (e.target.value) $('#e-icon-url', box).value = e.target.value; });
  $('[data-act="cancel"]', box).onclick = closeModal;
  $('[data-act="apply"]', box).onclick = () => {
    const name = $('#e-name', box).value.trim();
    if (!name) { toast('名称不能为空', true); return; }
    t.name = name;
    t.vendor = $('#e-vendor', box).value.trim();
    t.category = $('#e-category', box).value;
    t.group = $('#e-group', box).value;
    if (t.group === 'saas') t.saas = true; else delete t.saas;
    t.tier = $('#e-tier', box).value;
    t.score = Math.min(10, Math.max(0, Number($('#e-score', box).value) || 0));
    t.pricing = $('#e-pricing', box).value.trim();
    t.featured = $('#e-featured', box).checked;
    t.icon = $('#e-icon-url', box).value.trim();
    t.reviewUrl = $('#e-review', box).value.trim();
    t.desc = $('#e-desc', box).value.trim();
    if (isNew) state.data.tools.push(t);
    setDirty(true);
    closeModal();
    renderTools();
  };
}

/* ---------------- news ---------------- */

function renderNews() {
  $('#content').innerHTML = `
    <div class="panel">
      <div class="toolbar">
        <span class="muted small">首页新闻流（新 5 条上首页，归档页显示全部）</span>
        <span style="flex:1"></span>
        <button class="btn btn-primary" id="news-add">+ 新增新闻</button>
      </div>
      <table class="table">
        <thead><tr><th>标签</th><th>时间</th><th>标题</th><th>链接</th><th class="actions">操作</th></tr></thead>
        <tbody>${state.data.news.map(n => `
          <tr data-id="${esc(n.id)}">
            <td><span class="pill on">${esc(tagLabel(n.tag))}</span></td>
            <td class="muted small">${esc(n.when)}</td>
            <td>${esc(n.title)}</td>
            <td class="small"><a href="${esc(n.url)}" target="_blank" rel="noopener">${esc(String(n.url || '').slice(0, 40))}</a></td>
            <td class="actions">
              <button class="btn btn-sm" data-act="edit">编辑</button>
              <button class="btn btn-sm btn-danger" data-act="del">删除</button>
            </td>
          </tr>`).join('') || '<tr><td colspan="5" class="empty">暂无新闻</td></tr>'}
        </tbody>
      </table>
      <p class="muted small" style="margin-top:.8rem">注意：新闻详情页是仓库里的静态文件，这里维护的是首页/归档列表的卡片数据。</p>
    </div>`;
  $('#news-add').addEventListener('click', () => newsEditor(null));
  $$('#content tbody tr').forEach(tr => {
    const n = state.data.news.find(x => x.id === tr.dataset.id);
    if (!n) return;
    $('[data-act="edit"]', tr).addEventListener('click', () => newsEditor(n));
    $('[data-act="del"]', tr).addEventListener('click', () =>
      confirmModal(`删除新闻「${n.title}」？`, () => {
        state.data.news = state.data.news.filter(x => x.id !== n.id);
        setDirty(true);
        renderNews();
      }));
  });
}

function newsEditor(n) {
  const isNew = !n;
  const item = n ? { ...n } : { id: 'news-' + Date.now().toString(36), tag: 'products', when: '刚刚', title: '', excerpt: '', url: '' };
  const tagOpts = TAGS.map(([v, l]) => `<option value="${v}" ${item.tag === v ? 'selected' : ''}>${l}</option>`).join('');
  const box = openModal(`
    <h2>${isNew ? '新增新闻' : '编辑新闻'}</h2>
    <div class="row">
      <div class="field"><label>标签</label><select id="e-tag">${tagOpts}</select></div>
      <div class="field"><label>时间文案</label><input id="e-when" value="${esc(item.when)}" placeholder="e.g. 9h ago / 2026-08-28"></div>
    </div>
    <div class="field"><label>标题 *</label><input id="e-title" value="${esc(item.title)}"></div>
    <div class="field"><label>摘要</label><textarea id="e-excerpt" rows="2">${esc(item.excerpt)}</textarea></div>
    <div class="field"><label>链接 URL</label><input id="e-url" value="${esc(item.url)}" placeholder="/news/xxx.html 或外部 URL"></div>
    <div class="modal-actions">
      <button class="btn" data-act="cancel">取消</button>
      <button class="btn btn-primary" data-act="apply">${isNew ? '添加' : '应用'}</button>
    </div>`);
  $('[data-act="cancel"]', box).onclick = closeModal;
  $('[data-act="apply"]', box).onclick = () => {
    const title = $('#e-title', box).value.trim();
    if (!title) { toast('标题不能为空', true); return; }
    item.tag = $('#e-tag', box).value;
    item.when = $('#e-when', box).value.trim();
    item.title = title;
    item.excerpt = $('#e-excerpt', box).value.trim();
    item.url = $('#e-url', box).value.trim();
    if (isNew) state.data.news.unshift(item);
    setDirty(true);
    closeModal();
    renderNews();
  };
}

/* ---------------- guides / courses ---------------- */

function renderGuides() {
  $('#content').innerHTML = `
    <div class="panel">
      <div class="toolbar">
        <span class="muted small">购买指南卡片（首页 + tools 页入口）</span>
        <span style="flex:1"></span>
        <button class="btn btn-primary" id="guide-add">+ 新增指南</button>
      </div>
      <table class="table">
        <thead><tr><th>图标</th><th>分类标签</th><th>标题</th><th>收录数</th><th>链接</th><th class="actions">操作</th></tr></thead>
        <tbody>${state.data.guides.map(g => `
          <tr data-id="${esc(g.id)}">
            <td style="font-size:1.2rem">${esc(g.emoji)}</td>
            <td class="muted small">${esc(g.catLabel)}</td>
            <td>${esc(g.title)}</td>
            <td class="muted small">${esc(String(g.count || ''))}</td>
            <td class="small"><a href="${esc(g.url)}" target="_blank" rel="noopener">${esc(String(g.url || '').slice(0, 40))}</a></td>
            <td class="actions">
              <button class="btn btn-sm" data-act="edit">编辑</button>
              <button class="btn btn-sm btn-danger" data-act="del">删除</button>
            </td>
          </tr>`).join('') || '<tr><td colspan="6" class="empty">暂无指南</td></tr>'}
        </tbody>
      </table>
    </div>`;
  $('#guide-add').addEventListener('click', () => guideEditor(null));
  $$('#content tbody tr').forEach(tr => {
    const g = state.data.guides.find(x => x.id === tr.dataset.id);
    if (!g) return;
    $('[data-act="edit"]', tr).addEventListener('click', () => guideEditor(g));
    $('[data-act="del"]', tr).addEventListener('click', () =>
      confirmModal(`删除指南「${g.title}」？`, () => {
        state.data.guides = state.data.guides.filter(x => x.id !== g.id);
        setDirty(true);
        renderGuides();
      }));
  });
}

function guideEditor(g) {
  const isNew = !g;
  const item = g ? { ...g } : { id: 'guide-' + Date.now().toString(36), slug: '', emoji: '📘', catLabel: 'Buying Guide', title: '', count: '', top: '', url: '' };
  const box = openModal(`
    <h2>${isNew ? '新增指南' : '编辑指南'}</h2>
    <div class="row">
      <div class="field"><label>Emoji</label><input id="e-emoji" value="${esc(item.emoji)}"></div>
      <div class="field"><label>分类标签</label><input id="e-catlabel" value="${esc(item.catLabel)}"></div>
      <div class="field"><label>收录数文案</label><input id="e-count" value="${esc(String(item.count ?? ''))}" placeholder="e.g. 10 Tools"></div>
    </div>
    <div class="field"><label>标题 *</label><input id="e-title" value="${esc(item.title)}"></div>
    <div class="field"><label>亮点文案 top</label><input id="e-top" value="${esc(item.top || '')}"></div>
    <div class="field"><label>链接 URL</label><input id="e-url" value="${esc(item.url)}" placeholder="/articles/xxx.html"></div>
    <div class="modal-actions">
      <button class="btn" data-act="cancel">取消</button>
      <button class="btn btn-primary" data-act="apply">${isNew ? '添加' : '应用'}</button>
    </div>`);
  $('[data-act="cancel"]', box).onclick = closeModal;
  $('[data-act="apply"]', box).onclick = () => {
    const title = $('#e-title', box).value.trim();
    if (!title) { toast('标题不能为空', true); return; }
    item.emoji = $('#e-emoji', box).value.trim();
    item.catLabel = $('#e-catlabel', box).value.trim();
    item.count = $('#e-count', box).value.trim();
    item.title = title;
    item.top = $('#e-top', box).value.trim();
    item.url = $('#e-url', box).value.trim();
    if (isNew) state.data.guides.push(item);
    setDirty(true);
    closeModal();
    renderGuides();
  };
}

function renderCourses() {
  $('#content').innerHTML = `
    <div class="panel">
      <div class="toolbar">
        <span class="muted small">课程频道（当前为空，前台隐藏）</span>
        <span style="flex:1"></span>
        <button class="btn btn-primary" id="course-add">+ 新增课程</button>
      </div>
      <table class="table">
        <thead><tr><th>免费</th><th>标题</th><th>评分</th><th>时长</th><th class="actions">操作</th></tr></thead>
        <tbody>${state.data.courses.map(c => `
          <tr data-id="${esc(c.id)}">
            <td><span class="pill ${c.free ? 'on' : ''}">${c.free ? 'FREE' : '付费'}</span></td>
            <td>${esc(c.title)}</td>
            <td class="muted small">${esc(String(c.rating || ''))}</td>
            <td class="muted small">${esc(String(c.duration || ''))}</td>
            <td class="actions">
              <button class="btn btn-sm" data-act="edit">编辑</button>
              <button class="btn btn-sm btn-danger" data-act="del">删除</button>
            </td>
          </tr>`).join('') || '<tr><td colspan="5" class="empty">暂无课程</td></tr>'}
        </tbody>
      </table>
    </div>`;
  $('#course-add').addEventListener('click', () => courseEditor(null));
  $$('#content tbody tr').forEach(tr => {
    const c = state.data.courses.find(x => x.id === tr.dataset.id);
    if (!c) return;
    $('[data-act="edit"]', tr).addEventListener('click', () => courseEditor(c));
    $('[data-act="del"]', tr).addEventListener('click', () =>
      confirmModal(`删除课程「${c.title}」？`, () => {
        state.data.courses = state.data.courses.filter(x => x.id !== c.id);
        setDirty(true);
        renderCourses();
      }));
  });
}

function courseEditor(c) {
  const isNew = !c;
  const item = c ? { ...c } : { id: 'course-' + Date.now().toString(36), title: '', desc: '', rating: '4.8', duration: '4 weeks', lessons: '24 lessons', learners: '', free: true, emoji: '🎓', banner: 'b1' };
  const box = openModal(`
    <h2>${isNew ? '新增课程' : '编辑课程'}</h2>
    <div class="field"><label>标题 *</label><input id="e-title" value="${esc(item.title)}"></div>
    <div class="field"><label>描述</label><textarea id="e-desc" rows="2">${esc(item.desc || '')}</textarea></div>
    <div class="row">
      <div class="field"><label>评分</label><input id="e-rating" value="${esc(String(item.rating || ''))}"></div>
      <div class="field"><label>时长</label><input id="e-duration" value="${esc(String(item.duration || ''))}"></div>
      <div class="field"><label>课时</label><input id="e-lessons" value="${esc(String(item.lessons || ''))}"></div>
    </div>
    <div class="field checkbox"><input type="checkbox" id="e-free" ${item.free ? 'checked' : ''}><label for="e-free">免费课程</label></div>
    <div class="modal-actions">
      <button class="btn" data-act="cancel">取消</button>
      <button class="btn btn-primary" data-act="apply">${isNew ? '添加' : '应用'}</button>
    </div>`);
  $('[data-act="cancel"]', box).onclick = closeModal;
  $('[data-act="apply"]', box).onclick = () => {
    const title = $('#e-title', box).value.trim();
    if (!title) { toast('标题不能为空', true); return; }
    item.title = title;
    item.desc = $('#e-desc', box).value.trim();
    item.rating = $('#e-rating', box).value.trim();
    item.duration = $('#e-duration', box).value.trim();
    item.lessons = $('#e-lessons', box).value.trim();
    item.free = $('#e-free', box).checked;
    if (isNew) state.data.courses.push(item);
    setDirty(true);
    closeModal();
    renderCourses();
  };
}

/* ---------------- logos ---------------- */

function renderLogos() {
  $('#content').innerHTML = `
    <div class="panel">
      <div class="toolbar">
        <span class="muted small">Logo 库：工具编辑器中可选用；上传的图片由 /assets/ 提供</span>
        <span style="flex:1"></span>
        <input type="file" id="logo-file" accept="image/png,image/jpeg,image/webp,image/svg+xml" hidden>
        <button class="btn btn-primary" id="logo-upload">+ 上传图片</button>
      </div>
      <div class="logo-grid">
        ${state.data.logos.map(l => `
          <div class="logo-cell" data-id="${esc(l.id)}">
            <img src="${esc(l.file)}" alt="" loading="lazy" onerror="this.replaceWith('(图片缺失)')">
            <span title="${esc(l.name)}">${esc(l.name)}</span>
            <span class="small" style="color:var(--danger);cursor:pointer" data-act="del">移除</span>
          </div>`).join('') || '<p class="empty">Logo 库为空</p>'}
      </div>
    </div>`;

  $('#logo-upload').addEventListener('click', () => $('#logo-file').click());
  $('#logo-file').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    if (file.size > 150 * 1024) { toast('图片超过 150KB，请压缩后上传', true); return; }
    const dataUrl = await new Promise((resolve, reject) => {
      const fr = new FileReader();
      fr.onload = () => resolve(fr.result);
      fr.onerror = reject;
      fr.readAsDataURL(file);
    });
    try {
      const r = await api('/api/upload', { method: 'POST', body: JSON.stringify({ dataUrl, name: file.name }) });
      state.data.logos.push({ id: r.id, name: file.name.replace(/\.[^.]+$/, ''), file: r.url });
      setDirty(true);
      renderLogos();
      toast('上传成功，保存后生效');
    } catch (err) {
      toast(err.message, true);
    }
  });

  $$('[data-act="del"]').forEach(el => el.addEventListener('click', () => {
    const l = state.data.logos.find(x => x.id === el.closest('.logo-cell').dataset.id);
    confirmModal(`从库中移除「${l.name}」？（不影响已引用该图 URL 的工具）`, () => {
      state.data.logos = state.data.logos.filter(x => x.id !== l.id);
      setDirty(true);
      renderLogos();
    });
  }));
}

/* ---------------- submissions ---------------- */

const CAT_ALIASES = { writing: 'chat', coding: 'code', 'image-video': 'image', productivity: 'productivity', audio: 'audio', business: 'business', other: 'chat' };

function renderSubmissions() {
  const items = state.submissions;
  $('#content').innerHTML = `
    <div class="panel">
      <div class="toolbar">
        <span class="muted small">来自 submit.html 的用户提交</span>
        <span style="flex:1"></span>
        <button class="btn" id="subs-refresh">刷新</button>
      </div>
      ${items.map(s => `
        <div class="sub-card" data-id="${esc(s.id)}">
          <div class="sub-head">
            <strong>${esc(s.toolName)}</strong>
            <span>
              <button class="btn btn-sm btn-primary" data-act="adopt">采纳为工具草稿</button>
              <button class="btn btn-sm btn-danger" data-act="del">删除</button>
            </span>
          </div>
          <div class="sub-meta">${new Date(s.at || 0).toLocaleString()} · ${esc(s.category || '—')} · ${esc(s.pricing || '定价未填')} · ${esc(s.contactName || '')} &lt;${esc(s.contactEmail || '')}&gt;${s.contactRole ? ' · ' + esc(s.contactRole) : ''}</div>
          <div class="small">${esc(s.description || '')}</div>
          ${s.features ? `<div class="small muted" style="margin-top:.3rem">功能：${esc(s.features)}</div>` : ''}
          ${s.unique ? `<div class="small muted" style="margin-top:.3rem">亮点：${esc(s.unique)}</div>` : ''}
          ${s.notes ? `<div class="small muted" style="margin-top:.3rem">备注：${esc(s.notes)}</div>` : ''}
          ${s.toolUrl ? `<div class="small" style="margin-top:.3rem"><a href="${esc(s.toolUrl)}" target="_blank" rel="noopener">${esc(s.toolUrl)}</a></div>` : ''}
        </div>`).join('') || '<p class="empty">暂无提交</p>'}
    </div>`;

  $('#subs-refresh').addEventListener('click', async () => {
    const subs = await api('/api/submissions');
    state.submissions = subs.items || [];
    updateNavCounts();
    renderSubmissions();
  });

  $$('.sub-card').forEach(card => {
    const s = state.submissions.find(x => x.id === card.dataset.id);
    if (!s) return;
    $('[data-act="del"]', card).addEventListener('click', () =>
      confirmModal('删除这条提交？', async () => {
        await api(`/api/submissions?id=${encodeURIComponent(s.id)}`, { method: 'DELETE' });
        state.submissions = state.submissions.filter(x => x.id !== s.id);
        updateNavCounts();
        renderSubmissions();
      }));
    $('[data-act="adopt"]', card).addEventListener('click', () =>
      confirmModal('将提交转为工具草稿（评分 0，未精选）并删除该提交？草稿仍需你编辑完善后保存。', async () => {
        state.data.tools.push({
          id: 'draft-' + Date.now().toString(36),
          name: s.toolName,
          icon: '',
          category: CAT_ALIASES[s.category] || 'chat',
          score: 0,
          vendor: s.contactName || '',
          tier: 'freemium',
          pricing: s.pricing || '',
          featured: false,
          group: 'ai',
          reviewUrl: '',
          desc: s.description || ''
        });
        await api('/api/data', { method: 'PUT', body: JSON.stringify(state.data) });
        await refreshMeta();
        setDirty(false);
        await api(`/api/submissions?id=${encodeURIComponent(s.id)}`, { method: 'DELETE' });
        state.submissions = state.submissions.filter(x => x.id !== s.id);
        updateNavCounts();
        toast('已保存为工具草稿，可在「工具管理」中完善');
        renderSubmissions();
      }));
  });
}

/* ---------------- settings ---------------- */

function renderSettings() {
  const s = state.data.settings || {};
  $('#content').innerHTML = `
    <div class="panel" style="max-width:640px">
      <div class="field"><label>站点名称 siteName</label><input id="s-siteName" value="${esc(s.siteName || '')}"></div>
      <div class="field"><label>Hero 徽标文案 heroBadge</label><input id="s-heroBadge" value="${esc(s.heroBadge || '')}"></div>
      <div class="field"><label>Hero 标题 heroTitle</label><input id="s-heroTitle" value="${esc(s.heroTitle || '')}"></div>
      <div class="field"><label>Hero 高亮词 heroHighlight</label><input id="s-heroHighlight" value="${esc(s.heroHighlight || '')}"></div>
      <div class="field"><label>Hero 副标题 heroSub</label><textarea id="s-heroSub" rows="2">${esc(s.heroSub || '')}</textarea></div>
      <p class="muted small">保存后首页 Hero 区即时更新（前台缓存 ≤60 秒）。</p>
    </div>`;
  ['siteName', 'heroBadge', 'heroTitle', 'heroHighlight', 'heroSub'].forEach(k => {
    $('#s-' + k).addEventListener('change', e => {
      state.data.settings = state.data.settings || {};
      state.data.settings[k] = e.target.value;
      setDirty(true);
    });
  });
}

/* ---------------- backups ---------------- */

function renderBackups() {
  $('#content').innerHTML = `
    <div class="panel">
      <div class="toolbar">
        <span class="muted small">每次保存自动快照（保留最近 20 份）</span>
        <span style="flex:1"></span>
        <button class="btn" id="bk-export">导出当前数据 JSON</button>
        <button class="btn" id="bk-refresh">刷新列表</button>
      </div>
      <div id="bk-list"><p class="empty">加载中…</p></div>
    </div>`;
  loadBackups();

  $('#bk-refresh').addEventListener('click', loadBackups);
  $('#bk-export').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(state.data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `stackhk-site-data-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  });
}

async function loadBackups() {
  const listEl = $('#bk-list');
  try {
    const r = await api('/api/backups');
    if (!r.backups.length) { listEl.innerHTML = '<p class="empty">暂无快照（首次保存后生成）</p>'; return; }
    listEl.innerHTML = `<table class="table">
      <thead><tr><th>快照时间</th><th>工具数</th><th>新闻数</th><th class="actions">操作</th></tr></thead>
      <tbody>${r.backups.map(b => `
        <tr>
          <td class="small">${esc(b.timestamp.replace('T', ' ').replace(/-/g, (m, off, whole) => off > 10 ? ':' : m))} (UTC)</td>
          <td>${b.tools}</td><td>${b.news}</td>
          <td class="actions"><button class="btn btn-sm" data-ts="${esc(b.key)}">恢复此快照</button></td>
        </tr>`).join('')}
      </tbody></table>`;
    $$('button[data-ts]', listEl).forEach(btn => btn.addEventListener('click', () =>
      confirmModal('恢复此快照将覆盖当前线上数据（当前数据会先被快照一次）。继续？', async () => {
        try {
          const r2 = await api('/api/backups/restore', { method: 'POST', body: JSON.stringify({ timestamp: btn.dataset.ts }) });
          toast(`已恢复（新版本 v${r2.version}）`);
          state.data = await api('/api/data');
          setDirty(false);
        } catch (e) { toast(e.message, true); }
      })));
  } catch (e) {
    listEl.innerHTML = `<p class="empty">${esc(e.message)}</p>`;
  }
}

/* ---------------- health ---------------- */

function renderHealth() {
  $('#content').innerHTML = `
    <div class="panel" style="max-width:640px">
      <div class="toolbar"><span class="muted small">/api/health 实时状态</span><span style="flex:1"></span><button class="btn btn-sm" id="h-refresh">重新检测</button></div>
      ${healthHtml()}
      <p class="muted small" style="margin-top:.8rem">若 KV 显示异常，请检查 Pages 项目的 KV 绑定与 Secrets 配置。</p>
    </div>`;
  $('#h-refresh').addEventListener('click', async () => {
    state.health = await api('/api/health');
    renderHealth();
  });
}

/* ---------------- boot ---------------- */

(async function boot() {
  try {
    const s = await api('/api/auth/session');
    state.csrf = s.csrf;
    state.username = s.username;
    await enterApp();
  } catch (e) {
    showLogin();
  }
})();
