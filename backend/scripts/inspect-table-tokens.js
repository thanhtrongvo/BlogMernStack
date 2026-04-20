const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const Post = require('../models/Post');

(async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/blog');
  const p = await Post.findOne({ slug: '500-thu-nghiem-tri-nho-ai-van-de-khong-phai-la-goi-nho-ma-la-lien-ket-mnx4xkw1' }, { content: 1 });
  const m = (p.content || '').match(/<p>([\s\S]*?Các chỉ số[\s\S]*?)<\/p>/i);
  if (!m) {
    console.log('no match');
    await mongoose.disconnect();
    return;
  }
  const tokens = m[1].split('|').map((s) => s.trim()).filter(Boolean);
  console.log('token_count=', tokens.length);
  console.log(tokens.slice(0, 40));
  await mongoose.disconnect();
})();
