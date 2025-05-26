const Category = require('../models/Category');

exports.getAllCategories = async (req, res) => { 
    try {
        const categories = await Category.find(); 
        res.status(200).json(categories);

    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching categories' });
    }

}

exports.getCategoryById = async (req, res) => { 
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.status(200).json(category);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching category' });
    }
}
exports.createCategory = async (req, res) => {
    const { name, description } = req.body;

    try {
        const newCategory = new Category({
            name,
            description
        });
        await newCategory.save();
        res.status(201).json(newCategory);
    } catch (error) {
        console.error('Error creating category:', error);
        res.status(500).json({ message: 'Error creating category', error: error.message });
    }
}
exports.updateCategory = async (req, res) => {
    const { name, description } = req.body;
    try {
        const category = await Category.findByIdAndUpdate(req.params.id, {
            name,
            description,
            updatedAt: Date.now()
        }, { new: true });
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.status(200).json(category);
    } catch (error) {
        console.error('Error updating category:', error);
        res.status(500).json({ message: 'Error updating category', error: error.message });
    }
}

exports.deleteCategory = async (req, res) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.status(200).json({ message: 'Category deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting category' });
    }
}