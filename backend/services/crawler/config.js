const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

module.exports = {
    // Zyte API (Automatic Extraction)
    zyte: {
        apiKey: process.env.ZYTE_API_KEY || '',
        baseUrl: 'https://api.zyte.com/v1/extract',
    },

    // Ollama AI
    ollama: {
        host: process.env.OLLAMA_HOST || 'http://localhost:11434',
        model: process.env.OLLAMA_MODEL || 'llama3',
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
