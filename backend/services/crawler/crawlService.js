const config = require('./config');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchArticlesFromSource(sourceUrl) {
    try {
        const response = await fetch(`${config.firecrawl.baseUrl}/scrape`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.firecrawl.apiKey}`,
            },
            body: JSON.stringify({
                url: sourceUrl,
                formats: ['links']
            }),
        });

        if (!response.ok) return {};
        return await response.json();
    } catch (error) {
        return {};
    }
}

function parseArticles(firecrawlResponse, source) {
    let urls = [];
    if (firecrawlResponse.success && firecrawlResponse.data && Array.isArray(firecrawlResponse.data.links)) {
        urls = firecrawlResponse.data.links;
    }
    
    const articles = [];
    const maxArticles = config.crawler.maxArticlesPerSource || 3;
    let count = 0;

    for (const url of urls) {
        if (count >= maxArticles) break;
        if (!url.startsWith('http') || url.includes('/category/') || url.includes('/tags/') || url.includes('/author/')) continue;
        // Tránh crawl lại chính trang chủ
        if (url === source.url || url === source.url + '/') continue;
        
        articles.push({
            headline: 'Pending Title', 
            articleBody: '',
            sourceUrl: url,
            sourceCategory: source?.category || '',
            images: []
        });
        count++;
    }
    
    return articles;
}

const { execSync } = require('child_process');

async function enrichThinArticles(articles, sourceName) {
    for (const article of articles) {
        console.log(`[Crawl] [${sourceName}] Dùng AI Rewrite Tool tải nội dung cho: ${article.sourceUrl}`);
        try {
            // Dùng Firecrawl lấy nội dung chi tiết bài viết dưới định dạng markdown
            const response = await fetch(`${config.firecrawl.baseUrl}/scrape`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${config.firecrawl.apiKey}`
                },
                body: JSON.stringify({
                    url: article.sourceUrl,
                    formats: ['markdown']
                }),
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.data) {
                    article.headline = data.data.metadata?.title || article.headline;
                    article.articleBody = data.data.markdown || '';
                    
                    // Lấy ảnh đại diện (og:image)
                    if (data.data.metadata && data.data.metadata.ogImage) {
                        article.images = [data.data.metadata.ogImage];
                    }
                    
                    console.log(`[Crawl] Lấy thành công từ Firecrawl: ${article.headline} (${article.articleBody.length} chars)`);
                } else {
                    console.log(`[Crawl] Firecrawl trả về lỗi logic: ${JSON.stringify(data)}`);
                }
            } else {
                console.log(`[Crawl] Lỗi tải từ Firecrawl: ${response.status}`);
            }
        } catch (error) {
            console.error(`[Crawl] Không thể tải: ${article.sourceUrl} (${error.message})`);
        }
        await sleep(config.crawler.requestDelay);
    }
    
    return articles.filter(a => a.articleBody && a.articleBody.length > 500); 
}

async function crawlAllSources(sources) {
    console.log(`[Crawl] Bắt đầu lấy link từ ${sources.length} nguồn...`);
    const allArticles = [];

    for (const source of sources) {
        console.log(`[Crawl] Lấy trang chủ: ${source.name} (${source.url})`);

        const zyteResponse = await fetchArticlesFromSource(source.url);
        let articles = parseArticles(zyteResponse, source);
        console.log(`[Crawl] Found ${articles.length} link từ ${source.name}`);

        articles = await enrichThinArticles(articles, source.name);

        console.log(`[Crawl] Found ${articles.length} bài có nội dung tốt từ ${source.name}`);
        allArticles.push(...articles);
        await sleep(config.crawler.requestDelay);
    }

    return allArticles;
}

module.exports = { crawlAllSources, fetchArticlesFromSource, parseArticles };
