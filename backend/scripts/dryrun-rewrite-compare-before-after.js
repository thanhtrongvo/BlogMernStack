const fs = require('fs');
const path = require('path');
const { crawlAllSources } = require('../services/crawler/crawlService');
const sources = require('../services/crawler/sources.json');
const { rewriteArticle: rewriteV2 } = require('../services/crawler/rewriteService');
const { rewriteArticle: rewriteV1 } = require('../services/crawler/rewriteService.v1');

function isSecurityNews(a) {
  const text = `${a?.headline || ''} ${a?.metadata?.source || ''}`.toLowerCase();
  return ['cve','zero-day','ransomware','malware','exploit','breach','security','hacker','the hacker news','bleepingcomputer']
    .some(k => text.includes(k));
}

(async () => {
  const crawled = await crawlAllSources(sources);
  const chosen = [];
  const bySource = new Set();

  for (const a of crawled) {
    const src = a?.metadata?.source || 'Unknown';
    const len = (a.articleBody || '').length;
    if (!isSecurityNews(a)) continue;
    if (len < 3000) continue;
    if (bySource.has(src)) continue;
    bySource.add(src);
    chosen.push(a);
    if (chosen.length >= 3) break;
  }

  const outDir = '/home/thanhtrongvo/.openclaw/workspace/rewrites';
  fs.mkdirSync(outDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outPath = path.join(outDir, `rewrite-before-after-v2-${stamp}.json`);

  const results = [];

  for (const a of chosen) {
    const sourceLen = (a.articleBody || '').length;

    const before = await rewriteV1({ ...a });
    const after = await rewriteV2({ ...a });

    const beforeLen = (before.content || '').length;
    const afterLen = (after.content || '').length;

    const beforeRatio = sourceLen ? +(beforeLen / sourceLen).toFixed(3) : null;
    const afterRatio = sourceLen ? +(afterLen / sourceLen).toFixed(3) : null;

    results.push({
      source: a.metadata?.source,
      url: a.sourceUrl,
      sourceTitle: a.headline,
      sourceLen,
      before: {
        title: before.title,
        len: beforeLen,
        ratio: beforeRatio,
        preview: (before.content || '').slice(0, 600),
      },
      after: {
        title: after.title,
        len: afterLen,
        ratio: afterRatio,
        preview: (after.content || '').slice(0, 600),
      },
      deltaLen: afterLen - beforeLen,
      deltaRatio: (afterRatio !== null && beforeRatio !== null) ? +(afterRatio - beforeRatio).toFixed(3) : null,
      hitTarget: sourceLen > 3000 ? afterRatio >= 0.95 : null,
    });
  }

  fs.writeFileSync(outPath, JSON.stringify({ generatedAt: new Date().toISOString(), picked: chosen.length, results }, null, 2));
  console.log('BEFORE_AFTER_PATH=' + outPath);
})();
