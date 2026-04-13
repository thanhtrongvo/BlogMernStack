const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const Post = require('../models/Post');
const { normalizeGeneratedContent } = require('../services/crawler/rewriteService');

async function run() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/blog');

  const posts = await Post.find({ content: /<p>\s*\|/i }, { title: 1, slug: 1, content: 1 });
  let fixed = 0;

  for (const post of posts) {
    const next = normalizeGeneratedContent(post.content || '');
    if (!next || next === post.content) continue;

    await Post.updateOne({ _id: post._id }, { $set: { content: next } });
    fixed++;
    console.log(`[PipeTableFix] Updated: ${post.title} (${post.slug})`);
  }

  console.log(`[PipeTableFix] Done. candidates=${posts.length}, fixed=${fixed}`);
  await mongoose.disconnect();
}

run().catch(async (err) => {
  console.error('[PipeTableFix] Failed:', err);
  try { await mongoose.disconnect(); } catch {}
  process.exit(1);
});
