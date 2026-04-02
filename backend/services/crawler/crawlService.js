const config = require('./config');

/**
 * Crawl articles from news sources using Zyte API (Automatic Extraction).
 * Only returns articles published within the last 24 hours.
 */

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Fetch articles from a single source URL using Zyte API
 * @param {string} sourceUrl - The URL to crawl
 * @returns {Promise<object>} Zyte API response
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

/**
 * Parse and filter articles from Zyte API response
 * @param {object} zyteResponse - Raw response from Zyte API
 * @param {string} sourceName - Name of the source for logging
 * @returns {Array} Filtered articles within the last 24 hours
 */
function parseArticles(zyteResponse, source) {
    const sourceName = source?.name || 'Unknown Source';
    const articles = [];
    const cutoffTime = new Date(Date.now() - config.crawler.maxAgeHours * 60 * 60 * 1000);

    // Safely build an array of all articles from the response
    const rawList = zyteResponse.articleList;
    const allItems = [];

    // articleList can be an array, an object, or undefined
    if (Array.isArray(rawList)) {
        allItems.push(...rawList);
    } else if (rawList && typeof rawList === 'object') {
        // If it's an object with articles inside (e.g. { articles: [...] })
        if (Array.isArray(rawList.articles)) {
            allItems.push(...rawList.articles);
        } else {
            allItems.push(rawList);
        }
    }

    // Also handle single article response
    if (zyteResponse.article) {
        allItems.push(zyteResponse.article);
    }

    for (const article of allItems) {
        const publishDate = article.datePublished ? new Date(article.datePublished) : null;

        if (publishDate && publishDate < cutoffTime) {
            continue;
        }

        articles.push({
            headline: article.headline || article.name || 'Untitled',
            articleBody: article.articleBody || article.description || '',
            images: extractImages(article),
            metadata: {
                datePublished: article.datePublished,
                author: article.author || article.authorsList || [],
                source: sourceName,
                language: article.inLanguage || 'en',
            },
            sourceUrl: article.url || article.canonicalUrl || '',
            sourceCategory: source?.category || '',
        });
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
 * Main crawl function: fetch articles from all configured sources
 * @param {Array} sources - Array of source objects { name, url, category }
 * @returns {Promise<Array>} All articles from all sources
 */
async function crawlAllSources(sources) {
    console.log(`[Crawl] Starting crawl of ${sources.length} sources via Zyte API...`);
    const allArticles = [];

    for (const source of sources) {
        console.log(`[Crawl] Fetching from: ${source.name} (${source.url})`);

        const zyteResponse = await fetchArticlesFromSource(source.url);
        const articles = parseArticles(zyteResponse, source);

        console.log(`[Crawl] Found ${articles.length} recent articles from ${source.name}`);
        allArticles.push(...articles);

        await sleep(config.crawler.requestDelay);
    }

    console.log(`[Crawl] Total articles found: ${allArticles.length}`);
    return allArticles;
}

module.exports = { crawlAllSources, fetchArticlesFromSource, parseArticles };
