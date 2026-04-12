const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

module.exports = {
    // Zyte API (Automatic Extraction)
    zyte: {
        apiKey: process.env.ZYTE_API_KEY || '',
        baseUrl: 'https://api.zyte.com/v1/extract',
    },

    // OpenClaw rewrite API (OpenAI-compatible)
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
        maxAgeHours: 24,
        requestDelay: 2000,
    },
};
