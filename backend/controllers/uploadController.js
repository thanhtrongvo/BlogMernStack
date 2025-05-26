const cloudinary = require('../utils/cloudinaryConfig');
const fs = require('fs');

// Upload image to Cloudinary
exports.uploadImage = async (req, res) => {
    try {
        // Check if file exists
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Upload to cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'blog-images',
            use_filename: true
        });

        // Remove the file from local storage
        fs.unlinkSync(req.file.path);

        // Return the Cloudinary URL
        res.status(200).json({ 
            url: result.secure_url,
            publicId: result.public_id
        });
        
    } catch (error) {
        console.error('Error uploading image:', error);
        res.status(500).json({ message: 'Error uploading image' });
    }
};
