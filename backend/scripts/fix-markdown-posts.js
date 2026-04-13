const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const Post = require('../models/Post');
const { normalizeGeneratedContent } = require('../services/crawler/rewriteService');

function looksBrokenMarkdown(content = '') {
  if (!content) return false;
  const hasHtml = /<\/?(h1|h2|h3|h4|h5|h6|p|ul|ol|li|blockquote|strong|em|code|a)\b/i.test(content);
  if (hasHtml) return false;
  return /(^|\n)#{1,6}\s|\*\*[^*]+\*\*|(^|\n)\s*[-*+]\s+|(^|\n)\s*\d+\.\s+|\[.+\]\(https?:\/\/[^)]+\)/m.test(content);
}

async function run() {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/blog';
  await mongoose.connect(mongoUri);

  const candidates = await Post.find({}, { title: 1, content: 1, slug: 1 });
  let scanned = 0;
  let fixed = 0;

  for (const post of candidates) {
    scanned++;
    const original = post.content || '';
    if (!looksBrokenMarkdown(original)) continue;

    const normalized = normalizeGeneratedContent(original);
    if (!normalized || normalized === original) continue;

    await Post.updateOne(
      { _id: post._id },
      { $set: { content: normalized } }
    );

    fixed++;
    console.log(`[Fix] Updated: ${post.title} (${post.slug})`);
  }

  console.log(`\n[Fix] Done. scanned=${scanned}, fixed=${fixed}`);
  await mongoose.disconnect();
}

run().catch(async (err) => {
  console.error('[Fix] Failed:', err);
  try { await mongoose.disconnect(); } catch {}
  process.exit(1);
});
