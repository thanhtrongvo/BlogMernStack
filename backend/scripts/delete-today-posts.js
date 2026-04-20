const mongoose = require('mongoose');
const Post = require('../models/Post');

mongoose.connect('mongodb://localhost:27017/blog')
    .then(async () => {
        // Lấy từ đầu ngày hôm nay (20/4)
        const today = new Date('2026-04-20T00:00:00.000Z');
        const result = await Post.deleteMany({ createdAt: { $gte: today } });
        console.log(`[Script] Đã xóa thành công ${result.deletedCount} bài viết vừa đăng.`);
        process.exit(0);
    })
    .catch(console.error);
