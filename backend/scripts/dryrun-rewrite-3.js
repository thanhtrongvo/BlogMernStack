const fs = require('fs');
const path = require('path');
const { crawlAllSources } = require('../services/crawler/crawlService');
const { rewriteArticle } = require('../services/crawler/rewriteService');
const sources = require('../services/crawler/sources.json');

(async () => {
  const crawled = await crawlAllSources(sources);

  // Pick 3 representative technical/security posts with decent source length
  const chosen = [];
  const bySource = new Set();
  for (const a of crawled) {
    const src = a?.metadata?.source || 'Unknown';
    const len = (a.articleBody || '').length;
    const t = (a.headline || '').toLowerCase();

    if (len < 2400) continue;
    if (bySource.has(src)) continue;
    if (t.includes('webinar') || t.includes('guide') || t.includes('community of')) continue;

    bySource.add(src);
    chosen.push(a);
    if (chosen.length >= 3) break;
  }

  const outDir = '/home/thanhtrongvo/.openclaw/workspace/rewrites';
  fs.mkdirSync(outDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportPath = path.join(outDir, `rewrite-eval-3-${stamp}.md`);

  let report = `# Rewrite quality eval (3 samples)\n\nGenerated: ${new Date().toISOString()}\nPicked: ${chosen.length}\n\n`;

  for (let i = 0; i < chosen.length; i++) {
    const src = chosen[i];
    const out = await rewriteArticle(src);

    const sourceLen = (src.articleBody || '').length;
    const outLen = (out.content || '').length;
    const ratio = sourceLen ? (outLen / sourceLen).toFixed(2) : 'n/a';

    const sourceHead = (src.articleBody || '').slice(0, 800).replace(/\n/g, ' ');
    const outHead = (out.content || '').slice(0, 1200).replace(/\n/g, ' ');

    report += `## ${i + 1}) ${out.title}\n`;
    report += `- Source: ${src.metadata?.source}\n`;
    report += `- URL: ${src.sourceUrl}\n`;
    report += `- Source len: ${sourceLen}\n`;
    report += `- Rewritten len: ${outLen}\n`;
    report += `- Ratio: ${ratio}x\n\n`;

    report += `### Source preview\n${sourceHead}\n\n`;
    report += `### Rewritten preview\n${outHead}\n\n---\n\n`;
  }

  fs.writeFileSync(reportPath, report);
  console.log('REPORT_PATH=' + reportPath);
})();
