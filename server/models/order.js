const Mongoose = require('mongoose');
const { Schema } = Mongoose;

// Order Schema
const OrderSchema = new Schema({
  cart: {
    type: Schema.Types.ObjectId,
    ref: 'Cart'
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  total: {
    type: Number,
    default: 0
  },
  shippingAddress: {
    firstName: String,
    lastName: String,
    email: String,
    address: String,
    city: String,
    phone: String,
    zip: String
  },
  status: {
    type: String,
    default: 'Processing',
    enum: ['Not processed', 'Processing', 'Shipped', 'Delivered', 'Cancelled']
  },
  userRead: {
    type: Boolean,
    default: false
  },
  adminRead: {
    type: Boolean,
    default: false
  },
  updated: Date,
  created: {
    type: Date,
    default: Date.now
  }
});

module.exports = Mongoose.model('Order', OrderSchema);
