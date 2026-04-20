const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    slug: {
        type: String,
        unique: true,
        sparse: true,
    },
    description: {
        type: String,
    },
    sourceUrl: {
        type: String,
    },
    content: {
        type: String,
        required: true,
    },
    image : {
        type: String,
        default: 'https://via.placeholder.com/800x400.png?text=No+Image+Available',
    },
    createdAt: {    
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
    status: {
        type: Boolean,
        default: true,
    },
    author: {
        type: String,
        required: true,
    },
    // add relationships to category and comment
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
    },
    views: {
        type: Number,
        default: 0
    },
    
});



module.exports = mongoose.model('Post', PostSchema);