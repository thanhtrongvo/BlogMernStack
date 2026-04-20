const mongoose = require('./backend/node_modules/mongoose');
const Post = require('./backend/models/Post');

async function fixAuthors() {
    await mongoose.connect('mongodb://localhost:27017/blog');
    
    const result = await Post.updateMany(
        { author: "65d8c1c5a9b2447ebbd25b1c" },
        { $set: { author: "Admin" } }
    );
    
    console.log(`Updated ${result.modifiedCount} posts.`);
    process.exit(0);
}
fixAuthors();
