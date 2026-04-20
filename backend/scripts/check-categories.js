const mongoose = require('mongoose');
const Category = require('../models/Category');

mongoose.connect('mongodb://localhost:27017/blog')
    .then(async () => {
        const categories = await Category.find();
        console.log('--- DANH SÁCH CATEGORY TRONG DATABASE ---');
        categories.forEach(c => console.log(`- ${c.name} (ID: ${c._id})`));
        process.exit(0);
    })
    .catch(() => process.exit(1));
