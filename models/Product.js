const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  shortDescription: { type: String, required: true },
  longDescription: { type: String, default: '' },
  images: [{ type: String }], // Array of Cloudinary URLs
  material: { type: String, default: '' },
  dimensions: { type: String, default: '' },
  color: { type: String, default: '' },
  craftsmanship: { type: String, default: '' },
  care: { type: String, default: '' },
  availability: { type: String, default: '' }
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', productSchema);
