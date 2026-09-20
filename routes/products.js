const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const authMiddleware = require('../middleware/auth');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Multer storage for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'splendycraft_products',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp']
  }
});
const upload = multer({ storage: storage });

// GET /api/products - Get all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: 'Server error fetching products' });
  }
});

// POST /api/products - Create a new product
router.post('/', authMiddleware, upload.array('images'), async (req, res) => {
  try {
    const {
      id, name, category, shortDescription, longDescription,
      material, dimensions, color, craftsmanship, care, availability, existingImages
    } = req.body;
    
    // Extract Cloudinary URLs from uploaded files
    const newImageUrls = req.files ? req.files.map(file => file.path) : [];
    
    // Parse existingImages if sent as a JSON string
    let finalImages = [];
    if (existingImages) {
        try {
            finalImages = JSON.parse(existingImages);
        } catch (e) {
            if (Array.isArray(existingImages)) {
                finalImages = existingImages;
            } else {
                finalImages = [existingImages];
            }
        }
    }
    finalImages = finalImages.concat(newImageUrls);
    
    // If no images at all, add a default
    if (finalImages.length === 0) {
        finalImages = ['./logo.jpeg'];
    }

    const product = new Product({
      id, name, category, shortDescription, longDescription,
      material, dimensions, color, craftsmanship, care, availability,
      images: finalImages
    });

    const savedProduct = await product.save();
    res.status(201).json(savedProduct);
  } catch (err) {
    console.error('Error creating product:', err);
    // If duplicate ID error (code 11000)
    if (err.code === 11000) {
        return res.status(400).json({ error: 'A product with this ID already exists.' });
    }
    res.status(500).json({ error: 'Server error creating product', details: err.message });
  }
});

// PUT /api/products/:id - Update an existing product
router.put('/:id', authMiddleware, upload.array('images'), async (req, res) => {
  try {
    const productId = req.params.id;
    const {
      name, category, shortDescription, longDescription,
      material, dimensions, color, craftsmanship, care, availability, existingImages
    } = req.body;

    const product = await Product.findOne({ id: productId });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Extract Cloudinary URLs from new uploaded files
    const newImageUrls = req.files ? req.files.map(file => file.path) : [];
    
    // Parse existingImages if sent as a JSON string
    let finalImages = [];
    if (existingImages) {
        try {
            finalImages = JSON.parse(existingImages);
        } catch (e) {
            if (Array.isArray(existingImages)) {
                finalImages = existingImages;
            } else {
                finalImages = [existingImages];
            }
        }
    }
    finalImages = finalImages.concat(newImageUrls);

    // If no images at all, add a default
    if (finalImages.length === 0) {
        finalImages = ['./logo.jpeg'];
    }

    // Update fields
    product.name = name !== undefined ? name : product.name;
    // Note: We typically don't change the 'id' field as it's the unique identifier.
    // If you need to change it, it requires dropping the old record and creating a new one, 
    // or allowing 'id' updates in the schema (which is unique). We'll assume 'id' stays the same.
    product.category = category !== undefined ? category : product.category;
    product.shortDescription = shortDescription !== undefined ? shortDescription : product.shortDescription;
    product.longDescription = longDescription !== undefined ? longDescription : product.longDescription;
    product.material = material !== undefined ? material : product.material;
    product.dimensions = dimensions !== undefined ? dimensions : product.dimensions;
    product.color = color !== undefined ? color : product.color;
    product.craftsmanship = craftsmanship !== undefined ? craftsmanship : product.craftsmanship;
    product.care = care !== undefined ? care : product.care;
    product.availability = availability !== undefined ? availability : product.availability;
    product.images = finalImages;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({ error: 'Server error updating product', details: err.message });
  }
});

// DELETE /api/products/:id - Delete a product
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const productId = req.params.id;
    const deletedProduct = await Product.findOneAndDelete({ id: productId });
    
    if (!deletedProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Optional: We could also delete the associated images from Cloudinary here
    // using cloudinary.uploader.destroy(public_id) if we kept track of public_ids.

    res.json({ message: 'Product deleted successfully', product: deletedProduct });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ error: 'Server error deleting product' });
  }
});

module.exports = router;
