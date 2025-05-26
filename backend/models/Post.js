const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    image : {
        type: String,
        required: true,
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