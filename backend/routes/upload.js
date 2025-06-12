const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const { upload, deleteImage, extractPublicId } = require('../config/cloudinary');

// Upload single image
router.post('/image', protect, admin, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    // Return the uploaded image information (Cloudinary)
    res.json({
      message: 'Image uploaded successfully',
      image: {
        url: req.file.path, // Cloudinary URL
        publicId: req.file.filename, // Cloudinary public ID
        originalName: req.file.originalname,
        size: req.file.size,
      }
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ message: 'Error uploading image' });
  }
});

// Upload multiple images
router.post('/images', protect, admin, upload.array('images', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No image files provided' });
    }

    // Return the uploaded images information (Cloudinary)
    const images = req.files.map(file => ({
      url: file.path, // Cloudinary URL
      publicId: file.filename, // Cloudinary public ID
      originalName: file.originalname,
      size: file.size,
    }));

    res.json({
      message: 'Images uploaded successfully',
      images
    });
  } catch (error) {
    console.error('Images upload error:', error);
    res.status(500).json({ message: 'Error uploading images' });
  }
});

// Delete image
router.delete('/image/:publicId', protect, admin, async (req, res) => {
  try {
    const { publicId } = req.params;

    // Delete from Cloudinary
    const result = await deleteImage(publicId);

    if (result.result === 'ok' || result.result === 'not found') {
      res.json({
        message: 'Image deleted successfully',
        result: result.result
      });
    } else {
      res.status(400).json({
        message: 'Failed to delete image',
        result: result.result
      });
    }
  } catch (error) {
    console.error('Image deletion error:', error);
    res.status(500).json({ message: 'Error deleting image' });
  }
});

module.exports = router;
