const express = require('express');
const router = express.Router();
const { uploadImage } = require('../controllers/uploadController');
const upload = require('../utils/uploadConfig');
const auth = require('../middleware/auth');

// Route for uploading images
router.post('/', auth, upload.single('image'), uploadImage);

module.exports = router;
