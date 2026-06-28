// generate.mjs — 프로젝트별 정적 페이지 생성기 (검색·AI 크롤러용 + 진짜 URL)
//  index.html 안의 데이터(works, *Detail)를 읽어 /works/{id}.html · /play/{key}.html 정적 페이지와
//  sitemap.xml을 생성한다. index.html(SPA)은 건드리지 않고 데이터만 추출한다.
//  실행: node generate.mjs   (deploy.command에서 배포 직전 자동 실행)

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const SITE = 'https://www.oozoo.work';
const GA4 = 'G-XXXXXXXXXX'; // TODO: 실제 GA4 측정 ID로 교체 (index.html과 동일하게)
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

// ── index.html에서 데이터 리터럴만 안전 추출 (괄호 균형 매칭, 문자열/이스케이프 고려) ──
function extractLiteral(src, name) {
  const decl = `const ${name} = `;
  const i = src.indexOf(decl);
  if (i < 0) throw new Error('데이터 못 찾음: ' + name);
  let j = i + decl.length;
  const open = src[j];
  const close = open === '[' ? ']' : '}';
  let depth = 0, q = null;
  for (; j < src.length; j++) {
    const c = src[j];
    if (q) { if (c === '\\') { j++; continue; } if (c === q) q = null; continue; }
    if (c === '"' || c === "'" || c === '`') { q = c; continue; }
    if (c === open) depth++;
    else if (c === close) { depth--; if (depth === 0) { j++; break; } }
  }
  return src.slice(i + decl.length, j);
}
const ctx = {};
vm.createContext(ctx);
for (const name of ['categoryLabels', 'works', 'seedDetail', 'photoDetail', 'tmtDetail', 'artDetail']) {
  ctx[name] = vm.runInContext('(' + extractLiteral(html, name) + ')', ctx);
}
const { categoryLabels, works, seedDetail, photoDetail, tmtDetail, artDetail } = ctx;

// ── helpers ──
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const stripTags = s => String(s == null ? '' : s).replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\s+/g, ' ').trim();
const metaDesc = s => { const t = stripTags(s); return t.length > 155 ? t.slice(0, 152) + '…' : t; };

function pageShell({ url, title, desc, image, jsonld, body }) {
  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)} | 정은용</title>
  <meta name="description" content="${esc(desc)}">
  <link rel="canonical" href="${url}">
  <meta property="og:type" content="article">
  <meta property="og:title" content="${esc(title)} | 정은용">
  <meta property="og:description" content="${esc(desc)}">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="${image}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(title)} | 정은용">
  <meta name="twitter:description" content="${esc(desc)}">
  <meta name="twitter:image" content="${image}">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css">
  <script type="application/ld+json">${JSON.stringify(jsonld)}</script>
  <!-- Google Analytics 4 -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=${GA4}"></script>
  <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA4}');</script>
  <style>
    :root{--bg:#F8F7F4;--text:#1A1A1A;--sub:#6B6B6B;--muted:#9E9E9E;--accent:#2438D4;--line:#E5E3DD;--surface:#fff}
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Pretendard',-apple-system,sans-serif;background:var(--bg);color:var(--text);line-height:1.75;word-break:keep-all;overflow-wrap:break-word;-webkit-font-smoothing:antialiased}
    .wrap{max-width:760px;margin:0 auto;padding:32px 24px 80px}
    .top{display:flex;justify-content:space-between;align-items:center;padding:8px 0 28px;border-bottom:1px solid var(--line);margin-bottom:36px}
    .home{font-size:14px;font-weight:600;color:var(--text);text-decoration:none}
    .home:hover{color:var(--accent)}
    .kicker{font-size:12px;letter-spacing:.04em;color:var(--accent);font-weight:700;text-transform:uppercase}
    h1{font-size:30px;font-weight:700;letter-spacing:-.02em;line-height:1.25;margin:10px 0 8px}
    .tagline{font-size:16px;color:var(--sub);margin-bottom:24px}
    .cover{width:100%;aspect-ratio:3/2;object-fit:cover;border-radius:12px;background:var(--line);display:block;margin-bottom:28px}
    .meta{display:grid;grid-template-columns:repeat(2,1fr);gap:14px 20px;background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:20px 22px;margin-bottom:32px}
    .meta .lbl{font-size:12px;color:var(--muted);margin-bottom:3px}
    .meta .val{font-size:14px;color:var(--text);line-height:1.5}
    h2{font-size:18px;font-weight:700;margin:32px 0 12px;letter-spacing:-.01em}
    h3{font-size:15px;font-weight:700;color:var(--accent);margin:20px 0 8px}
    p{font-size:15px;color:var(--sub);margin:0 0 12px}
    ul{padding-left:20px;color:var(--sub);margin:0 0 12px}
    li{margin-bottom:5px;font-size:15px}
    blockquote{border-left:3px solid var(--line);padding:8px 0 8px 16px;color:var(--sub);font-style:italic;margin:0 0 14px}
    .callout{background:#EEF0FB;border-radius:10px;padding:16px 18px;font-size:14.5px;color:var(--text);margin:0 0 14px}
    .box{background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:18px 20px;margin:0 0 16px}
    .tags{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0 0}
    .tag{font-size:11px;font-weight:600;background:#EEF0FB;color:var(--accent);border-radius:999px;padding:4px 10px}
    .results{display:flex;flex-wrap:wrap;gap:12px;margin:8px 0 16px}
    .rc{flex:1;min-width:120px;background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:16px}
    .rc .n{font-size:20px;font-weight:800;color:var(--accent)}
    .rc .t{font-size:13px;color:var(--sub);margin-top:4px}
    a{color:var(--accent)}
    .cta{display:inline-block;margin-top:36px;background:var(--accent);color:#fff;text-decoration:none;font-weight:600;font-size:14px;padding:12px 22px;border-radius:999px}
    .foot{margin-top:48px;padding-top:24px;border-top:1px solid var(--line);font-size:13px;color:var(--muted)}
  </style>
</head>
<body>
  <main class="wrap">
    <div class="top">
      <a class="home" href="/">← 정은용 · oozoo.work</a>
      <a class="home" href="/#works">Works</a>
    </div>
    ${body}
    <a class="cta" href="/">전체 포트폴리오 보기 →</a>
    <div class="foot">© 정은용 (Eunyong Chung) · Experience Designer · <a href="mailto:oozoo.work@gmail.com">oozoo.work@gmail.com</a></div>
  </main>
</body>
</html>`;
}

function renderMeta(rows) {
  return `<div class="meta">${rows.map(r => `<div><div class="lbl">${esc(r.label)}</div><div class="val">${r.value}</div></div>`).join('')}</div>`;
}
function renderBlocksStatic(blocks) {
  return (blocks || []).map(b => {
    if (b.h !== undefined) return b.h ? `<h3>${b.h}</h3>` : '';
    if (b.p !== undefined) return `<p>${b.p}</p>`;
    if (b.callout !== undefined) return `<div class="callout">${b.callout}</div>`;
    if (b.introbox !== undefined) return `<div class="box">${b.introbox.map(p => `<p>${p}</p>`).join('')}</div>`;
    if (b.quote !== undefined) return `<blockquote>${b.quote}</blockquote>`;
    if (b.list !== undefined) return `<ul>${b.list.map(i => { const t = b.linkAll ? `<a href="${b.linkAll}" target="_blank" rel="noopener">${i.t}</a>` : i.t; return `<li>${t}</li>`; }).join('')}</ul>`;
    return '';
  }).join('');
}

// ── WORKS 페이지 ──
function workBody(w) {
  const meta = renderMeta([
    { label: '소속', value: esc(w.org) },
    { label: '기간', value: esc(w.period) },
    { label: '카테고리', value: esc(categoryLabels[w.category] || '') },
    { label: '역할 · 기여도', value: esc(stripTags(w.role)) }
  ]);
  const results = (w.results || []).length && typeof w.results[0] === 'object'
    ? `<div class="results">${w.results.map(r => `<div class="rc"><div class="n">${esc(String(r.n).replace(/▲/g, ' ▲'))}</div><div class="t">${esc(r.t)}</div></div>`).join('')}</div>` : '';
  const strat = (w.strategy || []).map(s => { const t = typeof s === 'string' ? s : s.t; return `<li>${t}</li>`; }).join('');
  const tags = `<div class="tags">${(w.tags || []).map(t => `<span class="tag">${esc(t)}</span>`).join('')}</div>`;
  const live = (w.liveUrl || []).map(l => `<a href="${l.url}" target="_blank" rel="noopener">${esc(l.label)} ↗</a>`).join(' · ');
  return `<div class="kicker">${esc(categoryLabels[w.category] || 'Works')}</div>
    <h1>${esc(w.title)}</h1>
    <p class="tagline">${w.tagline}</p>
    <img class="cover" src="/images/works/${w.folder}/cover.webp" alt="${esc(w.title)}" loading="lazy">
    ${w.intro ? `<p>${w.intro}</p>` : ''}
    ${meta}
    <h2>수행 업무</h2>${tags}${live ? `<p style="margin-top:10px">${live}</p>` : ''}
    <h2>목표</h2><p>${w.goal}</p>
    ${w.target ? `<h2>타겟</h2><p>${w.target}</p>` : ''}
    <h2>전략</h2>${(w.strategyCore || []).length ? `<ul>${w.strategyCore.map(s => `<li>${s}</li>`).join('')}</ul>` : ''}<ul>${strat}</ul>
    <h2>성과</h2>${results}${w.resultNote ? `<p>${w.resultNote}</p>` : ''}`;
}

// ── PLAYGROUND 페이지 ──
function detailBody(s, kicker) {
  const meta = s.meta ? renderMeta(s.meta) : '';
  const intro = s.intro ? `<div class="box">${s.intro.map(p => `<p>${p}</p>`).join('')}</div>` : '';
  const sections = (s.sections || []).map(sec => {
    let inner = '';
    if (sec.blocks) inner = renderBlocksStatic(sec.blocks);
    else if (sec.list) inner = `<ul>${sec.list.map(i => `<li>${i.t}</li>`).join('')}</ul>`;
    else if (sec.quotes) inner = sec.quotes.map(q => `<blockquote>${q}</blockquote>`).join('');
    return `${sec.h ? `<h2>${sec.h}</h2>` : ''}${inner}`;
  }).join('');
  const cards = s.cards ? s.cards.map(c => `<div class="box"><h3>${c.title}</h3><p>${c.desc}</p></div>`).join('') : '';
  const sale = s.sale ? `<h2>판매처</h2><p>${s.sale}</p>` : '';
  return `<div class="kicker">${esc(kicker)}</div>
    <h1>${esc(s.title)}</h1>
    <p class="tagline">${s.tagline}</p>
    ${s.cover ? `<img class="cover" src="/${s.cover}" alt="${esc(s.title)}" loading="lazy">` : ''}
    ${intro}${meta}${cards}${sections}${sale}`;
}

function jsonldFor(url, title, desc, image) {
  return {
    '@context': 'https://schema.org', '@type': 'CreativeWork',
    name: title, headline: title, description: desc, url, image,
    author: { '@type': 'Person', name: '정은용', alternateName: 'Eunyong Chung', url: SITE + '/' },
    inLanguage: 'ko'
  };
}

const pages = [];
for (const w of works) {
  const url = `${SITE}/works/${w.id}`;
  const desc = metaDesc(w.intro || w.tagline);
  const image = `${SITE}/images/works/${w.folder}/cover.webp`;
  pages.push({ file: `works/${w.id}.html`, url, html: pageShell({ url, title: w.title, desc, image, jsonld: jsonldFor(url, w.title, desc, image), body: workBody(w) }) });
}
const play = [
  { key: 'photo', s: photoDetail, kicker: '독립출판' },
  { key: 'seed', s: seedDetail, kicker: '커뮤니티' },
  { key: 'tmt', s: tmtDetail, kicker: '팟캐스트' },
  { key: 'art', s: artDetail, kicker: '프리랜서' }
];
for (const p of play) {
  const url = `${SITE}/play/${p.key}`;
  const desc = metaDesc((p.s.intro && p.s.intro[0]) || p.s.tagline);
  const image = p.s.cover ? `${SITE}/${p.s.cover}` : `${SITE}/images/og.jpg`;
  pages.push({ file: `play/${p.key}.html`, url, html: pageShell({ url, title: p.s.title, desc, image, jsonld: jsonldFor(url, p.s.title, desc, image), body: detailBody(p.s, p.kicker) }) });
}

for (const pg of pages) {
  const out = path.join(ROOT, pg.file);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, pg.html);
}

// ── sitemap.xml (홈 + 전 프로젝트) ──
const today = new Date().toISOString().slice(0, 10);
const urls = [SITE + '/', ...pages.map(p => p.url)];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url><loc>${u}</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>${u === SITE + '/' ? '1.0' : '0.8'}</priority></url>`).join('\n')}
</urlset>
`;
fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), sitemap);

console.log(`생성 완료: ${pages.length}개 페이지 + sitemap.xml (URL ${urls.length}개)`);
pages.forEach(p => console.log('  /' + p.file.replace(/\.html$/, '')));
