const { crawlAllSources } = require('../services/crawler/crawlService');
const sources = require('../services/crawler/sources.json');
const config = require('../services/crawler/config');

(async () => {
  const articles = await crawlAllSources(sources);
  const maxPerSource = config.crawler.maxArticlesPerSource || 3;
  const sourceCount = {};
  const filtered = articles.filter((a) => {
    // metadata is an array [{ source: ... }, ...] or object?
    const source = (a.metadata && a.metadata.source) || a.sourceUrl || 'unknown';
    sourceCount[source] = (sourceCount[source] || 0) + 1;
    return sourceCount[source] <= maxPerSource;
  });

  const finalCount = {};
  for (const a of filtered) {
    const source = (a.metadata && a.metadata.source) || a.sourceUrl || 'unknown';
    finalCount[source] = (finalCount[source] || 0) + 1;
  }

  console.log('maxPerSource=', maxPerSource);
  console.log('totalCrawled=', articles.length);
  console.log('afterLimit=', filtered.length);
  console.log(finalCount);
})();
