const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { runCrawlPipeline } = require('./services/crawler');

dotenv.config();

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log("Connected to DB, running crawler pipeline...");
    try {
      const result = await runCrawlPipeline();
      console.log("Crawl pipeline finished successfully:", result);
    } catch (e) {
      console.error("Crawl pipeline failed:", e);
    }
    process.exit(0);
  })
  .catch(err => {
    console.error("DB Connection Error:", err);
    process.exit(1);
  });
