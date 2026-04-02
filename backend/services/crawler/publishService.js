const config = require('./config');
const path = require('path');

// Direct MongoDB access (same codebase)
const mongoose = require('mongoose');
const Post = require(path.resolve(__dirname, '../../models/Post'));
const Category = require(path.resolve(__dirname, '../../models/Category'));

/**
 * Publish rewritten articles to the MERN blog backend.
 * Handles JWT authentication, duplication check, and POST request.
 */

let cachedToken = null;
let tokenExpiry = null;
let categoryMapCache = null;
let categoryMapExpiry = null;

/**
 * Login as admin to get JWT access token
 * @returns {Promise<string>} JWT access token
 */
async function getAuthToken() {
    // Return cached token if still valid (with 5-minute buffer)
    if (cachedToken && tokenExpiry && Date.now() < tokenExpiry - 5 * 60 * 1000) {
        return cachedToken;
    }

    console.log('[Publish] Logging in as admin to get JWT token...');

    const response = await fetch(`${config.blog.apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: config.blog.adminEmail,
            password: config.blog.adminPassword,
        }),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Login failed: ${response.status} - ${error}`);
    }

    const data = await response.json();
    cachedToken = data.accessToken;
    // JWT access tokens typically expire in 15-30 minutes
    tokenExpiry = Date.now() + 14 * 60 * 1000;

    console.log('[Publish] Login successful');
    return cachedToken;
}

/**
 * Check if an article already exists in the database (duplication check)
 * Uses direct MongoDB query for efficiency.
 * @param {string} sourceUrl - Original article URL
 * @param {string} title - Rewritten title (fallback check)
 * @returns {Promise<boolean>} true if article already exists
 */
async function isDuplicate(sourceUrl, title) {
    try {
        const existing = await Post.findOne({
            $or: [
                { sourceUrl: sourceUrl },
                { title: title },
            ],
        });
        return !!existing;
    } catch (error) {
        console.error('[Publish] Duplication check error:', error.message);
        return false; // Allow publishing if check fails
    }
}

/**
 * Build category lookup map from DB (name -> _id)
 * @returns {Promise<Map<string, string>>}
 */
async function getCategoryMap() {
    if (categoryMapCache && categoryMapExpiry && Date.now() < categoryMapExpiry) {
        return categoryMapCache;
    }

    const categories = await Category.find({ status: 'active' }).lean();
    const map = new Map();

    for (const c of categories) {
        if (!c?.name || !c?._id) continue;
        const key = c.name.toLowerCase().trim();
        map.set(key, c._id.toString());
    }

    categoryMapCache = map;
    categoryMapExpiry = Date.now() + 10 * 60 * 1000; // cache 10 minutes
    return map;
}

/**
 * Resolve target category id for article based on source category/name
 * @param {object} article
 * @returns {Promise<string>}
 */
async function resolveCategoryId(article) {
    const categoryMap = await getCategoryMap();

    const normalize = (v) => (v || '').toString().toLowerCase().trim();
    const sourceCategory = normalize(article.sourceCategory);

    const aliases = {
        ai: ['ai', 'artificial intelligence', 'machine learning', 'ml'],
        'tin tức': ['tin tuc', 'news', 'technology', 'tech'],
        'học tập': ['hoc tap', 'guide', 'tutorial', 'how-to'],
        'thủ thuật': ['thu thuat', 'tips', 'tricks'],
        'kể chuyện': ['ke chuyen', 'story', 'opinion', 'insight'],
    };

    // Direct match by category name
    for (const [name, id] of categoryMap.entries()) {
        if (sourceCategory && sourceCategory === name) return id;
    }

    // Alias match -> existing category name in DB
    for (const [catName, keys] of Object.entries(aliases)) {
        if (keys.includes(sourceCategory) && categoryMap.has(catName)) {
            return categoryMap.get(catName);
        }
    }

    // Fallback to configured default category
    return config.blog.defaultCategory;
}

/**
 * Publish a single article to the blog
 * @param {object} article - Rewritten article { title, content, description, slug, thumbnailUrl, sourceUrl, sourceCategory }
 * @returns {Promise<object|null>} Created post or null if failed
 */
async function publishArticle(article) {
    // Step 1: Duplication check
    const duplicate = await isDuplicate(article.sourceUrl, article.title);
    if (duplicate) {
        console.log(`[Publish] SKIPPED (duplicate): "${article.title}"`);
        return null;
    }

    // Step 2: Get auth token
    const token = await getAuthToken();

    // Step 3: Prepare payload
    const categoryId = await resolveCategoryId(article);

    const payload = {
        title: article.title,
        content: article.content,
        image: article.thumbnailUrl || 'https://placehold.co/800x400?text=No+Image',
        category: categoryId,
        status: true, // Auto-publish (true = published immediately, no approval needed)
        slug: article.slug,
        sourceUrl: article.sourceUrl,
        description: article.description,
    };

    // Step 4: POST to blog API
    try {
        const response = await fetch(`${config.blog.apiUrl}/posts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const error = await response.text();
            console.error(`[Publish] API error for "${article.title}": ${response.status} - ${error}`);
            return null;
        }

        const post = await response.json();
        console.log(`[Publish] SUCCESS: "${article.title}" (ID: ${post._id})`);
        return post;
    } catch (error) {
        console.error(`[Publish] Network error for "${article.title}":`, error.message);
        return null;
    }
}

/**
 * Publish multiple articles
 * @param {Array} articles - Array of rewritten articles
 * @returns {Promise<object>} Summary { published, skipped, failed }
 */
async function publishAllArticles(articles) {
    console.log(`[Publish] Publishing ${articles.length} articles...`);

    let published = 0;
    let skipped = 0;
    let failed = 0;

    for (const article of articles) {
        const result = await publishArticle(article);
        if (result) {
            published++;
        } else if (await isDuplicate(article.sourceUrl, article.title)) {
            skipped++;
        } else {
            failed++;
        }
    }

    const summary = { published, skipped, failed };
    console.log(`[Publish] Done: ${published} published, ${skipped} skipped (duplicate), ${failed} failed`);
    return summary;
}

module.exports = { publishArticle, publishAllArticles, isDuplicate, getAuthToken };
