const { crawlAllSources } = require('./crawlService');
const { rewriteAllArticles } = require('./rewriteService');
const { publishAllArticles } = require('./publishService');
const sources = require('./sources.json');
const config = require('./config');

/**
 * Main orchestrator: Crawl → Rewrite → Publish pipeline
 * 
 * This is the entry point for the automation service.
 * It can be called from:
 *   - node-cron scheduler (automatic)
 *   - Manual trigger via POST /api/crawler/run
 *   - Direct invocation: node services/crawler/index.js
 */

/**
 * Run the full Crawl → Rewrite → Publish pipeline
 * @returns {Promise<object>} Pipeline execution summary
 */
async function runCrawlPipeline() {
    const startTime = Date.now();
    console.log('='.repeat(60));
    console.log(`[Pipeline] Starting Crawl-Rewrite-Publish pipeline`);
    console.log(`[Pipeline] Time: ${new Date().toISOString()}`);
    console.log(`[Pipeline] Sources: ${sources.length}`);
    console.log(`[Pipeline] Rewrite model: ${config.openclaw.model}`);
    console.log('='.repeat(60));

    const result = {
        startedAt: new Date().toISOString(),
        crawled: 0,
        rewritten: 0,
        published: { published: 0, skipped: 0, failed: 0 },
        errors: [],
        duration: 0,
    };

    try {
        // Step 1: CRAWL
        console.log('\n📡 [Step 1/3] Crawling articles from sources...');
        const articles = await crawlAllSources(sources);
        result.crawled = articles.length;

        const sourceCount = {};
        const filteredArticles = articles.filter(article => {
            sourceCount[article.metadata.source] = (sourceCount[article.metadata.source] || 0) + 1;
            return sourceCount[article.metadata.source] <= 4;
        });
        
        console.log(`[Pipeline] Limited to ${filteredArticles.length} articles (max 4 per source).`);

        if (filteredArticles.length === 0) {
            console.log('[Pipeline] No new articles found. Exiting.');
            result.duration = Date.now() - startTime;
            return result;
        }

        // Step 2: REWRITE
        console.log('\n✍️  [Step 2/3] Rewriting articles with AI...');
        const rewritten = await rewriteAllArticles(filteredArticles);
        result.rewritten = rewritten.length;

        if (rewritten.length === 0) {
            console.log('[Pipeline] No articles were successfully rewritten. Exiting.');
            result.duration = Date.now() - startTime;
            return result;
        }

        // Step 3: PUBLISH
        console.log('\n📤 [Step 3/3] Publishing articles to blog...');
        result.published = await publishAllArticles(rewritten);

    } catch (error) {
        console.error('[Pipeline] Critical error:', error.message);
        result.errors.push(error.message);
    }

    result.duration = Date.now() - startTime;
    const durationMin = (result.duration / 1000 / 60).toFixed(1);

    console.log('\n' + '='.repeat(60));
    console.log('[Pipeline] SUMMARY:');
    console.log(`  📡 Crawled:   ${result.crawled} articles`);
    console.log(`  ✍️  Rewritten: ${result.rewritten} articles`);
    console.log(`  📤 Published: ${result.published.published} articles`);
    console.log(`  ⏭️  Skipped:   ${result.published.skipped} (duplicates)`);
    console.log(`  ❌ Failed:    ${result.published.failed} articles`);
    console.log(`  ⏱️  Duration:  ${durationMin} minutes`);
    console.log('='.repeat(60));

    return result;
}

// Allow direct execution: node services/crawler/index.js
if (require.main === module) {
    const path = require('path');
    const mongoose = require('mongoose');
    require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

    const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/blog';

    mongoose.connect(MONGO_URI)
        .then(() => {
            console.log('[Pipeline] Connected to MongoDB');
            return runCrawlPipeline();
        })
        .then((result) => {
            console.log('\n[Pipeline] Finished. Result:', JSON.stringify(result, null, 2));
            process.exit(0);
        })
        .catch((err) => {
            console.error('[Pipeline] Fatal error:', err);
            process.exit(1);
        });
}

module.exports = { runCrawlPipeline };
