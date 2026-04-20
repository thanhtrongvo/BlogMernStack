const { runCrawlPipeline } = require('/home/thanhtrongvo/projects/BlogMernStack/backend/services/crawler/index.js');
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/blog')
    .then(() => {
        console.log('[Manual Run] Connected to MongoDB');
        return runCrawlPipeline();
    })
    .then((result) => {
        console.log('[Manual Run] Finished:', result);
        process.exit(0);
    })
    .catch((err) => {
        console.error('[Manual Run] Error:', err);
        process.exit(1);
    });
