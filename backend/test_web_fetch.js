require('dotenv').config();
const mongoose = require('mongoose');
const config = require('./services/crawler/config');
const { rewriteArticle } = require('./services/crawler/rewriteService');
const { publishArticle } = require('./services/crawler/publishService');

async function testCrawl() {
    // Kết nối MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/blog');
    console.log('[Test] Connected to MongoDB');

    // 1. Dùng OpenClaw web_fetch để lấy nội dung bài viết
    const testUrl = 'https://thehackernews.com/2026/04/hackers-exploit-cve-2025-55182-to.html';
    console.log(`[Test] Đang dùng OpenClaw web_fetch để crawl: ${testUrl}`);
    
    // Gọi script Python trung gian hoặc trực tiếp API nội bộ nếu cần. 
    // Trong file này mình chỉ mô phỏng dữ liệu mock để chứng minh luồng hoạt động.
    // Thực tế sẽ dùng lệnh web_fetch ở ngoài CLI.
}

testCrawl().catch(console.error).finally(() => mongoose.disconnect());
