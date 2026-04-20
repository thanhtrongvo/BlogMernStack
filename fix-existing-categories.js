const mongoose = require('./backend/node_modules/mongoose');
const Post = require('./backend/models/Post');
const Category = require('./backend/models/Category');

async function distributeCategories() {
    await mongoose.connect('mongodb://localhost:27017/blog');
    
    // Get all categories
    const categories = await Category.find();
    if(categories.length === 0) {
        console.log('No categories found');
        process.exit(1);
    }
    
    // Get all posts that are currently in "Học Tập" category
    const hocTapCategory = categories.find(c => c.name === 'Học Tập');
    if(!hocTapCategory) {
        console.log('Học Tập category not found');
        process.exit(1);
    }
    
    const posts = await Post.find({ category: hocTapCategory._id });
    console.log(`Found ${posts.length} posts in Học Tập`);
    
    let updated = 0;
    for(let i=0; i<posts.length; i++) {
        // distribute them sequentially across all categories
        const newCategory = categories[i % categories.length];
        if(newCategory._id.toString() !== hocTapCategory._id.toString()) {
            posts[i].category = newCategory._id;
            await posts[i].save();
            updated++;
        }
    }
    
    console.log(`Distributed ${updated} posts across other categories.`);
    process.exit(0);
}
distributeCategories();
