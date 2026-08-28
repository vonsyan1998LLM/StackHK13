// Server-side validation for the site data document saved via PUT /api/data.
// The document shape mirrors what js/tp-main.js consumes (see api-seed.json).

const MAX_BYTES = 1_500_000;

function str(v, max = 500) {
  return typeof v === 'string' ? v.slice(0, max) : '';
}

export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.code = 'VALIDATION';
  }
}

export function normalizeSiteData(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new ValidationError('Body must be an object');
  }
  for (const k of ['tools', 'news', 'courses']) {
    if (!Array.isArray(body[k])) throw new ValidationError(`Field "${k}" must be an array`);
  }
  const data = {
    settings: body.settings && typeof body.settings === 'object' && !Array.isArray(body.settings)
      ? body.settings
      : {},
    tools: body.tools,
    news: body.news,
    courses: body.courses,
    guides: Array.isArray(body.guides) ? body.guides : [],
    logos: Array.isArray(body.logos) ? body.logos : []
  };

  const seen = new Set();
  const uniqueId = (base) => {
    let id = base || 'item';
    let n = 2;
    while (seen.has(id)) id = `${base}-dup-${n++}`;
    seen.add(id);
    return id;
  };

  data.tools = data.tools.map((t, i) => {
    if (!t || typeof t !== 'object') throw new ValidationError(`tools[${i}] must be an object`);
    const name = str(t.name, 120).trim();
    if (!name) throw new ValidationError(`tools[${i}]: "name" is required`);
    const score = Number(t.score);
    if (Number.isNaN(score) || score < 0 || score > 10) {
      throw new ValidationError(`Tool "${name}": score must be a number between 0 and 10`);
    }
    return {
      ...t,
      id: typeof t.id === 'string' && t.id ? uniqueId(t.id) : uniqueId('tool-' + (i + 1)),
      name,
      score: Math.round(score * 10) / 10,
      category: str(t.category, 40),
      vendor: str(t.vendor, 120),
      tier: str(t.tier, 20),
      pricing: str(t.pricing, 80),
      group: str(t.group, 20),
      icon: str(t.icon, 300),
      reviewUrl: str(t.reviewUrl, 300),
      desc: str(t.desc, 600),
      featured: !!t.featured
    };
  });

  data.news = data.news.map((n, i) => {
    if (!n || typeof n !== 'object') throw new ValidationError(`news[${i}] must be an object`);
    const title = str(n.title, 200).trim();
    if (!title) throw new ValidationError(`news[${i}]: "title" is required`);
    return {
      ...n,
      id: typeof n.id === 'string' && n.id ? uniqueId(n.id) : uniqueId('news-' + (i + 1)),
      tag: str(n.tag, 30),
      when: str(n.when, 40),
      title,
      excerpt: str(n.excerpt, 500),
      url: str(n.url, 300)
    };
  });

  data.courses = data.courses.map((c, i) => {
    if (!c || typeof c !== 'object') throw new ValidationError(`courses[${i}] must be an object`);
    const title = str(c.title, 200).trim();
    if (!title) throw new ValidationError(`courses[${i}]: "title" is required`);
    return { ...c, id: typeof c.id === 'string' && c.id ? uniqueId(c.id) : uniqueId('course-' + (i + 1)), title };
  });

  data.guides = data.guides.map((g, i) => {
    if (!g || typeof g !== 'object') throw new ValidationError(`guides[${i}] must be an object`);
    const title = str(g.title, 200).trim();
    if (!title) throw new ValidationError(`guides[${i}]: "title" is required`);
    return {
      ...g,
      id: typeof g.id === 'string' && g.id ? uniqueId(g.id) : uniqueId('guide-' + (i + 1)),
      title,
      url: str(g.url, 300)
    };
  });

  data.logos = data.logos.map((l, i) => {
    if (!l || typeof l !== 'object') throw new ValidationError(`logos[${i}] must be an object`);
    return {
      ...l,
      id: typeof l.id === 'string' && l.id ? uniqueId(l.id) : uniqueId('logo-' + (i + 1)),
      name: str(l.name, 120),
      file: str(l.file, 300)
    };
  });

  data.settings = {
    siteName: str(data.settings.siteName, 80),
    heroBadge: str(data.settings.heroBadge, 80),
    heroTitle: str(data.settings.heroTitle, 120),
    heroHighlight: str(data.settings.heroHighlight, 120),
    heroSub: str(data.settings.heroSub, 300)
  };

  const bytes = JSON.stringify(data).length;
  if (bytes > MAX_BYTES) {
    throw new ValidationError(`Document too large (${bytes} bytes, max ${MAX_BYTES})`);
  }
  return data;
}

// Submission payload from the public form.
export function normalizeSubmission(body) {
  if (!body || typeof body !== 'object') throw new ValidationError('Invalid body');
  const clean = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
  const s = {
    toolName: clean(body.toolName, 120),
    toolUrl: clean(body.toolUrl, 300),
    category: clean(body.category, 40),
    description: clean(body.description, 300),
    pricing: clean(body.pricing, 120),
    features: clean(body.features, 1500),
    unique: clean(body.unique, 1500),
    contactName: clean(body.contactName, 120),
    contactEmail: clean(body.contactEmail, 200),
    contactRole: clean(body.contactRole, 120),
    freeAccount: clean(body.freeAccount, 20),
    notes: clean(body.notes, 1500)
  };
  if (!s.toolName) throw new ValidationError('Tool name is required');
  if (!/^https?:\/\/.+\..+/.test(s.toolUrl)) throw new ValidationError('A valid tool website URL is required');
  if (!s.description) throw new ValidationError('Description is required');
  if (!s.contactName) throw new ValidationError('Contact name is required');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.contactEmail)) throw new ValidationError('A valid contact email is required');
  return s;
}
