const mongoose = require('./backend/node_modules/mongoose');
const Category = require('./backend/models/Category');

async function checkCategories() {
    await mongoose.connect('mongodb://localhost:27017/blog');
    const categories = await Category.find();
    console.log(categories);
    process.exit(0);
}
checkCategories();
