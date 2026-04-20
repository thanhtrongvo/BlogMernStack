const fs = require('fs');
const path = require('path');
const { rewriteArticle } = require('../services/crawler/rewriteService');

(async () => {
  const articleBody = fs.readFileSync(path.resolve(__dirname, './cpuid-source.txt'), 'utf8').slice(0, 1800);
  const result = await rewriteArticle({
    headline: 'CPUID hacked to deliver malware via CPU-Z, HWMonitor downloads',
    articleBody,
    images: [],
    metadata: { source: 'BleepingComputer' },
    sourceUrl: 'https://www.bleepingcomputer.com/news/security/supply-chain-attack-at-cpuid-pushes-malware-with-cpu-z-hwmonitor/'
  });

  console.log('title=', result.title);
  console.log('len=', (result.content || '').length);
  console.log((result.content || '').slice(0, 400));
})();
