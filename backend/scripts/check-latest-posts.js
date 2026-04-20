const mongoose = require('mongoose');
const Post = require('../models/Post');

mongoose.connect('mongodb://localhost:27017/blog')
    .then(async () => {
        const posts = await Post.find().sort({ createdAt: -1 }).limit(3).select('title sourceUrl category');
        console.log('--- 3 BÀI VIẾT MỚI VỪA ĐƯỢC PUBLISH ---');
        posts.forEach(p => {
            console.log(`- ${p.title} (Category ID: ${p.category})`);
        });
        process.exit(0);
    })
    .catch(() => process.exit(1));
