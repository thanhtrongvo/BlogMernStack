const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({ 
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true,
    },
    content: {
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
});
CommentSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});
CommentSchema.pre('update', function(next) {
    this.update({}, { $set: { updatedAt: Date.now() } });
    next();
});
CommentSchema.pre('findOneAndUpdate', function(next) {
    this.set({ updatedAt: Date.now() });
    next();
});
CommentSchema.pre('find', function(next) {
    this.set({ updatedAt: Date.now() });
    next();
});
CommentSchema.pre('deleteOne', function(next) {
    this.set({ updatedAt: Date.now() });
    next();
});

module.exports = mongoose.model('Comment', CommentSchema);