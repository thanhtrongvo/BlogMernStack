const fs = require('fs');
const path = require('path');
const { crawlAllSources } = require('../services/crawler/crawlService');
const { rewriteArticle } = require('../services/crawler/rewriteService');
const sources = require('../services/crawler/sources.json');

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
  const outPath = path.join(outDir, `rewrite-compare-v2-${stamp}.json`);

  const oldBaseline = {
    'https://thehackernews.com/2026/04/block-prompt-not-work-end-of-doctor-no.html': { rewrittenLen: 4660 },
    'https://www.bleepingcomputer.com/news/security/supply-chain-attack-at-cpuid-pushes-malware-with-cpu-z-hwmonitor/': { rewrittenLen: 2982 }
  };

  const results = [];
  for (const a of chosen) {
    const out = await rewriteArticle(a);
    const sourceLen = (a.articleBody || '').length;
    const rewrittenLen = (out.content || '').length;
    const ratio = sourceLen ? +(rewrittenLen / sourceLen).toFixed(3) : null;

    const baseline = oldBaseline[a.sourceUrl];
    const baselineLen = baseline?.rewrittenLen || null;
    const baselineRatio = baselineLen && sourceLen ? +(baselineLen / sourceLen).toFixed(3) : null;

    results.push({
      title: out.title,
      source: a.metadata?.source,
      url: a.sourceUrl,
      sourceLen,
      rewrittenLen,
      ratio,
      baselineLen,
      baselineRatio,
      deltaLen: baselineLen ? (rewrittenLen - baselineLen) : null,
      deltaRatio: baselineRatio !== null ? +(ratio - baselineRatio).toFixed(3) : null,
      preview: (out.content || '').slice(0, 800)
    });
  }

  fs.writeFileSync(outPath, JSON.stringify({ generatedAt: new Date().toISOString(), picked: chosen.length, results }, null, 2));
  console.log('COMPARE_PATH=' + outPath);
})();
