const router = require('express').Router();

const { getAllCategories, getCategoryById, createCategory, updateCategory, deleteCategory } = require('../controllers/categoryController');
const auth = require('../middleware/auth');

// Public route for getting active categories
router.get('/public', async (req, res) => {
    try {
        const Category = require('../models/Category');
        const categories = await Category.find({ status: 'active' });
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching categories' });
    }
});

// Protected routes
router.get('/', auth, getAllCategories);
router.get('/:id', auth, getCategoryById);
router.post('/', auth, createCategory);
router.put('/:id', auth, updateCategory);
router.delete('/:id', auth, deleteCategory);

module.exports = router;