const config = require('./config');

/**
 * Crawl articles from news sources using Zyte API (Automatic Extraction).
 * By default, only keeps content published within the configured maxAgeHours.
 *
 * Quality strategy:
 * 1) Crawl source listing pages
 * 2) Parse candidate article URLs
 * 3) For thin entries (empty/short body), fetch article detail URL directly
 * 4) Keep only entries with enough usable content
 */

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Fetch extraction payload from Zyte API for any URL (listing or article)
 * @param {string} sourceUrl
 * @returns {Promise<object>}
 */
async function fetchArticlesFromSource(sourceUrl) {
    try {
        const response = await fetch(config.zyte.baseUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${Buffer.from(config.zyte.apiKey + ':').toString('base64')}`,
            },
            body: JSON.stringify({
                url: sourceUrl,
                article: true,
                articleList: true,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[Crawl] Zyte API error for ${sourceUrl}: ${response.status} - ${errorText}`);
            return {};
        }

        return await response.json();
    } catch (error) {
        console.error(`[Crawl] Error fetching from ${sourceUrl}:`, error.message);
        return {};
    }
}

function getPublishDate(article) {
    return article?.datePublished ? new Date(article.datePublished) : null;
}

function isLikelyNoiseUrl(url = '') {
    const u = (url || '').toLowerCase();
    if (!u.startsWith('http')) return true;

    const blockedPatterns = [
        '/tag/',
        '/category/',
        '/search',
        '/page/',
        '/newsletter',
        '/podcasts/',
        '/presentations/',
        '/minibooks/',
        'utm_',
        'hubs.li/',
        '/webinar',
    ];

    return blockedPatterns.some((p) => u.includes(p));
}

function isLikelyBadArticle(normalized) {
    const headline = (normalized?.headline || '').toString().trim();
    const body = (normalized?.articleBody || '').toString().trim();

    if (!headline || /^untitled$/i.test(headline)) return true;
    if (headline.length < 12 && body.length < 800) return true;

    const bannedHeadlinePatterns = [
        /^untitled$/i,
        /^no title$/i,
        /^404/i,
        /^page not found/i,
        /^forbidden/i,
        /^access denied/i,
    ];

    if (bannedHeadlinePatterns.some((re) => re.test(headline))) return true;

    return false;
}

/**
 * Normalize one Zyte article payload into internal shape
 */
function toInternalArticle(article, source) {
    return {
        headline: article.headline || article.name || 'Untitled',
        articleBody: article.articleBody || article.description || article.text || '',
        images: extractImages(article),
        metadata: {
            datePublished: article.datePublished,
            author: article.author || article.authorsList || [],
            source: source?.name || 'Unknown Source',
            language: article.inLanguage || 'en',
        },
        sourceUrl: article.url || article.canonicalUrl || '',
        sourceCategory: source?.category || '',
    };
}

/**
 * Parse and filter articles from Zyte API response
 * @param {object} zyteResponse
 * @param {object} source
 * @returns {Array}
 */
function parseArticles(zyteResponse, source) {
    const sourceName = source?.name || 'Unknown Source';
    const articles = [];
    const cutoffTime = new Date(Date.now() - config.crawler.maxAgeHours * 60 * 60 * 1000);

    const rawList = zyteResponse.articleList;
    const allItems = [];

    if (Array.isArray(rawList)) {
        allItems.push(...rawList);
    } else if (rawList && typeof rawList === 'object') {
        if (Array.isArray(rawList.articles)) {
            allItems.push(...rawList.articles);
        } else {
            allItems.push(rawList);
        }
    }

    if (zyteResponse.article) {
        allItems.push(zyteResponse.article);
    }

    const seen = new Set();

    for (const item of allItems) {
        const normalized = toInternalArticle(item, source);
        const url = normalized.sourceUrl;

        if (!url || isLikelyNoiseUrl(url)) {
            continue;
        }

        if (isLikelyBadArticle(normalized)) {
            continue;
        }

        const publishDate = getPublishDate(item);
        if (publishDate && publishDate < cutoffTime) {
            continue;
        }

        const key = `${sourceName}|${url}`;
        if (seen.has(key)) continue;
        seen.add(key);

        articles.push(normalized);
    }

    return articles;
}

/**
 * Extract image URLs from a Zyte article object
 */
function extractImages(article) {
    const images = [];

    if (article.mainImage) {
        images.push(article.mainImage.url || article.mainImage);
    }
    if (article.images) {
        for (const img of article.images) {
            const imgUrl = typeof img === 'string' ? img : img.url;
            if (imgUrl && !images.includes(imgUrl)) {
                images.push(imgUrl);
            }
        }
    }

    return images;
}

/**
 * Fetch article detail for thin entries to improve rewrite quality
 */
async function enrichThinArticles(articles, sourceName) {
    const minBody = config.crawler.minBodyLengthForRewrite || 500;
    const maxDetailFetch = config.crawler.maxDetailFetchPerSource || 5;
    let fetched = 0;

    for (const article of articles) {
        const currentLen = (article.articleBody || '').length;
        if (currentLen >= minBody) continue;
        if (!article.sourceUrl || fetched >= maxDetailFetch) continue;

        fetched++;
        console.log(`[Crawl] [${sourceName}] Enriching thin article (${currentLen} chars): ${article.sourceUrl}`);

        const detail = await fetchArticlesFromSource(article.sourceUrl);
        const detailArticle = detail?.article;

        if (detailArticle) {
            const enriched = toInternalArticle(detailArticle, { name: sourceName, category: article.sourceCategory });
            if ((enriched.articleBody || '').length > currentLen) {
                article.articleBody = enriched.articleBody;
                article.images = enriched.images?.length ? enriched.images : article.images;
                article.metadata = { ...article.metadata, ...enriched.metadata };
            }
        }

        await sleep(config.crawler.requestDelay);
    }

    return articles;
}

/**
 * Main crawl function: fetch articles from all configured sources
 * @param {Array} sources
 * @returns {Promise<Array>}
 */
async function crawlAllSources(sources) {
    console.log(`[Crawl] Starting crawl of ${sources.length} sources via Zyte API...`);
    const allArticles = [];

    for (const source of sources) {
        console.log(`[Crawl] Fetching from: ${source.name} (${source.url})`);

        const zyteResponse = await fetchArticlesFromSource(source.url);
        let articles = parseArticles(zyteResponse, source);

        articles = await enrichThinArticles(articles, source.name);

        const minAcceptable = config.crawler.minAcceptableBodyLength || 300;
        articles = articles.filter((a) => (a.articleBody || '').length >= minAcceptable);

        console.log(`[Crawl] Found ${articles.length} usable recent articles from ${source.name}`);
        allArticles.push(...articles);

        await sleep(config.crawler.requestDelay);
    }

    console.log(`[Crawl] Total usable articles found: ${allArticles.length}`);
    return allArticles;
}

module.exports = { crawlAllSources, fetchArticlesFromSource, parseArticles };
