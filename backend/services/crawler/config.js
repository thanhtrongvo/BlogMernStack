const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

module.exports = {
    // Zyte API (Automatic Extraction)
    zyte: {
        apiKey: process.env.ZYTE_API_KEY || '',
        baseUrl: 'https://api.zyte.com/v1/extract',
    },

    // Ollama rewrite API
    ollama: {
        host: process.env.OLLAMA_HOST || 'http://127.0.0.1:11434',
        primaryModel: process.env.OLLAMA_PRIMARY_MODEL || 'gemma4:31b-cloud',
        fallbackModel: process.env.OLLAMA_FALLBACK_MODEL || 'gemma4:e4b',
        temperature: Number(process.env.OLLAMA_TEMPERATURE || 0.7),
    },

    // Legacy OpenClaw config kept for backward compatibility
    openclaw: {
        host: process.env.OPENCLAW_HOST || 'http://127.0.0.1:18789',
        token: process.env.OPENCLAW_TOKEN || '',
        model: process.env.OPENCLAW_MODEL || 'openclaw/default',
        backendModel: process.env.OPENCLAW_BACKEND_MODEL || '',
    },

    // Blog Backend API
    blog: {
        apiUrl: process.env.BLOG_API_URL || `http://localhost:${process.env.PORT || 5300}/api`,
        adminEmail: process.env.CRAWLER_ADMIN_EMAIL || '',
        adminPassword: process.env.CRAWLER_ADMIN_PASSWORD || '',
        defaultCategory: process.env.CRAWLER_DEFAULT_CATEGORY || '',
    },

    // Crawler settings
    crawler: {
        maxAgeHours: Number(process.env.CRAWLER_MAX_AGE_HOURS || 24),
        requestDelay: Number(process.env.CRAWLER_REQUEST_DELAY_MS || 2000),
        minBodyLengthForRewrite: Number(process.env.CRAWLER_MIN_BODY_LEN || 500),
        minAcceptableBodyLength: Number(process.env.CRAWLER_MIN_ACCEPTABLE_BODY_LEN || 300),
        maxDetailFetchPerSource: Number(process.env.CRAWLER_MAX_DETAIL_FETCH_PER_SOURCE || 5),
        maxArticlesPerSource: Number(process.env.CRAWLER_MAX_ARTICLES_PER_SOURCE || 3),
    },
};
