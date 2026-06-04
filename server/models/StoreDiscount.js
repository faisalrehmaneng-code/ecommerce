const mongoose = require('mongoose');

const storeDiscountSchema = new mongoose.Schema(
  {
    discountType: {
      type: String,
      enum: ['percent', 'flat'],
      required: true
    },
    discountValue: {
      type: Number,
      required: true
    },
    isActive: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('StoreDiscount', storeDiscountSchema);
