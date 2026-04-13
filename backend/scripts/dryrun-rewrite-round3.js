const fs = require('fs');
const path = require('path');
const { crawlAllSources } = require('../services/crawler/crawlService');
const sources = require('../services/crawler/sources.json');
const { rewriteArticle } = require('../services/crawler/rewriteService');
const { rewriteArticle: rewriteV1 } = require('../services/crawler/rewriteService.v1');

function isSecurityNews(a) {
  const text = `${a?.headline || ''} ${a?.metadata?.source || ''}`.toLowerCase();
  return ['cve','zero-day','ransomware','malware','exploit','breach','security','hacker','the hacker news','bleepingcomputer']
    .some(k => text.includes(k));
}

function hasWrapper(html='') {
  const t = html.toLowerCase();
  return t.includes('<!doctype') || t.includes('<html') || t.includes('<head') || t.includes('<body');
}

(async () => {
  const crawled = await crawlAllSources(sources);
  const chosen = [];
  const bySource = new Set();

  for (const a of crawled) {
    const src = a?.metadata?.source || 'Unknown';
    const len = (a.articleBody || '').length;
    if (!isSecurityNews(a) || len < 3000) continue;
    if (bySource.has(src)) continue;
    bySource.add(src);
    chosen.push(a);
    if (chosen.length >= 3) break;
  }

  const outDir = '/home/thanhtrongvo/.openclaw/workspace/rewrites';
  fs.mkdirSync(outDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outPath = path.join(outDir, `rewrite-round3-${stamp}.json`);

  const rows = [];
  for (const a of chosen) {
    const sourceLen = (a.articleBody || '').length;

    const before = await rewriteV1({ ...a });
    const after = await rewriteArticle({ ...a });

    const beforeLen = (before.content || '').length;
    const afterLen = (after.content || '').length;

    rows.push({
      source: a.metadata?.source,
      title: a.headline,
      url: a.sourceUrl,
      sourceLen,
      beforeLen,
      beforeRatio: +(beforeLen / sourceLen).toFixed(3),
      afterLen,
      afterRatio: +(afterLen / sourceLen).toFixed(3),
      deltaRatio: +((afterLen / sourceLen) - (beforeLen / sourceLen)).toFixed(3),
      hitTargetAfter: +(afterLen / sourceLen).toFixed(3) >= 0.95,
      wrapperBefore: hasWrapper(before.content || ''),
      wrapperAfter: hasWrapper(after.content || ''),
      previewAfter: (after.content || '').slice(0, 700)
    });
  }

  fs.writeFileSync(outPath, JSON.stringify({ generatedAt: new Date().toISOString(), picked: chosen.length, rows }, null, 2));
  console.log('ROUND3_PATH=' + outPath);
})();
