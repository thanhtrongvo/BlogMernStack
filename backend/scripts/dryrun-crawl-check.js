const { crawlAllSources } = require('../services/crawler/crawlService');
const sources = require('../services/crawler/sources.json');

(async () => {
  const out = await crawlAllSources(sources);
  console.log('TOTAL', out.length);
  const pick = out.slice(0,20).map(a => ({
    src: a.metadata?.source,
    len: (a.articleBody || '').length,
    url: a.sourceUrl,
    title: a.headline,
  }));
  console.log(JSON.stringify(pick, null, 2));
})();
