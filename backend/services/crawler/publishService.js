const config = require('./config');
const path = require('path');
const Post = require('../../models/Post');
const Category = require('../../models/Category');

let categoryMapCache = null;
let categoryMapExpiry = 0;

/**
 * Fetch categories from DB and build a lookup map
 */
async function getCategoryMap() {
    if (categoryMapCache && categoryMapExpiry && Date.now() < categoryMapExpiry) {
        return categoryMapCache;
    }

    try {
        const categories = await Category.find({}, '_id name');
        categoryMapCache = new Map();
        
        categories.forEach(cat => {
            const name = (cat.name || '').toString().toLowerCase().trim();
            categoryMapCache.set(name, cat._id.toString());
        });

        // Cache for 15 minutes
        categoryMapExpiry = Date.now() + 15 * 60 * 1000;
        return categoryMapCache;
    } catch (error) {
        console.error('[Publish] Failed to fetch categories from DB:', error.message);
        throw error;
    }
}

/**
 * Find matching category ID based on article sourceCategory or fallback
 */
async function resolveCategoryId(article) {
    const categoryMap = await getCategoryMap();

    const normalize = (v) => (v || '').toString().toLowerCase().trim();
    const sourceCategory = article.sourceCategory || '';
    const sourceCategoryNorm = normalize(sourceCategory);

    const aliases = {
        'ai': ['ai', 'artificial intelligence', 'machine learning', 'ml'],
        'tin tức': ['tin tuc', 'news', 'technology', 'tech', 'tin tức'],
        'học tập': ['hoc tap', 'guide', 'tutorial', 'how-to', 'học tập'],
        'thủ thuật': ['thu thuat', 'tips', 'tricks', 'thủ thuật'],
        'kể chuyện': ['ke chuyen', 'story', 'opinion', 'insight', 'kể chuyện'],
    };

    // Direct match by category name
    for (const [name, id] of categoryMap.entries()) {
        if (sourceCategoryNorm && sourceCategoryNorm === name) return id;
        if (sourceCategory && sourceCategory.toLowerCase() === name.toLowerCase()) return id;
    }

    // Alias match
    for (const [catName, keys] of Object.entries(aliases)) {
        if (keys.includes(sourceCategoryNorm) && categoryMap.has(catName)) {
            return categoryMap.get(catName);
        }
    }

    // Fallback to config default
    const fallbackNorm = normalize(config.blog.defaultCategory || 'tin tức');
    if (categoryMap.has(fallbackNorm)) {
        return categoryMap.get(fallbackNorm);
    }

    // Ultimate fallback: Pick a random category instead of just the first one
    const categoryIds = Array.from(categoryMap.values());
    if (categoryIds.length > 0) {
        const randomIndex = Math.floor(Math.random() * categoryIds.length);
        return categoryIds[randomIndex];
    }
    
    // Use proper mongoose ObjectId generator instead of undefined `Types.ObjectId()`
    const mongoose = require('mongoose');
    return new mongoose.Types.ObjectId().toString();
}

/**
 * Check if article already exists based on title or sourceUrl
 */
async function isDuplicate(sourceUrl, title) {
    try {
        const existing = await Post.findOne({
            $or: [
                { sourceUrl: sourceUrl },
                { title: title }
            ]
        });
        return !!existing;
    } catch (error) {
        return false;
    }
}

/**
 * Publish a single article directly to MongoDB
 */
async function publishArticle(article) {
    const minPublishLen = config?.crawler?.minPublishContentLength || 0;
    const contentLen = (article?.content || '').length;

    // Step 1: Quality gate (long-form floor)
    if (minPublishLen > 0 && contentLen < minPublishLen) {
        console.log(`[Publish] Skipped (Too short ${contentLen}<${minPublishLen}): "${article.title}"`);
        return null;
    }

    // Step 2: Duplication check
    const duplicate = await isDuplicate(article.sourceUrl, article.title);
    if (duplicate) {
        console.log(`[Publish] Skipped (Duplicate): "${article.title}"`);
        return null; // Return null so caller knows it was skipped
    }

    // Step 3: Prepare payload
    const categoryId = await resolveCategoryId(article);
    const finalImage = (article.thumbnailUrl && article.thumbnailUrl.trim() !== '') 
                       ? article.thumbnailUrl 
                       : 'https://placehold.co/800x400?text=No+Image';

    const payload = {
        title: article.title,
        content: article.content,
        image: finalImage,
        category: categoryId,
        status: true,
        slug: article.slug,
        sourceUrl: article.sourceUrl,
        description: article.description,
        author: "admin" // Update author from hardcoded ObjectId to a display name like "admin"
    };

    // Step 3: Save directly to MongoDB via Mongoose
    try {
        const newPost = new Post(payload);
        await newPost.save();
        console.log(`[Publish] SUCCESS: "${article.title}"`);
        return newPost;
    } catch (error) {
        console.error(`[Publish] Database error for "${article.title}":`, error.message);
        return false;
    }
}

/**
 * Publish multiple articles
 */
async function publishAllArticles(articles) {
    console.log(`[Publish] Publishing ${articles.length} articles to DB...`);

    let published = 0;
    let skipped = 0;
    let failed = 0;

    for (const article of articles) {
        const result = await publishArticle(article);
        if (result && result._id) {
            published++;
        } else if (result === null) {
            skipped++;
        } else {
            failed++;
        }
    }

    const summary = { published, skipped, failed };
    console.log(`[Publish] Done: ${published} published, ${skipped} skipped (duplicate), ${failed} failed`);
    return summary;
}

module.exports = { publishArticle, publishAllArticles, isDuplicate, resolveCategoryId };
