const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const Post = require('../models/Post');
const { normalizeGeneratedContent } = require('../services/crawler/rewriteService');

async function run() {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/blog';
  await mongoose.connect(mongoUri);

  const query = {
    $or: [
      { content: /```/ },
      { content: /[─-]{8,}/ },
      { content: /<p>\s*[─-]{8,}\s*<\/p>/ }
    ]
  };

  const posts = await Post.find(query, { title: 1, slug: 1, content: 1 });
  let fixed = 0;

  for (const post of posts) {
    const original = post.content || '';
    const normalized = normalizeGeneratedContent(original);

    if (!normalized || normalized === original) continue;

    await Post.updateOne({ _id: post._id }, { $set: { content: normalized } });
    fixed++;
    console.log(`[ArtifactFix] Updated: ${post.title} (${post.slug})`);
  }

  console.log(`[ArtifactFix] Done. candidates=${posts.length}, fixed=${fixed}`);
  await mongoose.disconnect();
}

run().catch(async (err) => {
  console.error('[ArtifactFix] Failed:', err);
  try { await mongoose.disconnect(); } catch {}
  process.exit(1);
});
