const mongoose = require('mongoose');

const promoCardSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    subtitle: { type: String, required: true },
    imageUrl: { type: String, default: '' }, // Store S3 URL
    imageKey: { type: String, default: '' } // Store S3 Key for deletion
  },
  { timestamps: true }
);

module.exports = mongoose.model('PromoCard', promoCardSchema);
