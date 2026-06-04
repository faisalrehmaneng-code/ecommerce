const Mongoose = require('mongoose');
const { Schema } = Mongoose;

const ShippingSchema = new Schema({
    configType: {
        type: String,
        default: 'default',
        unique: true
    },
    // Mode: 'free', 'fixed', or 'custom'
    shippingMode: {
        type: String,
        default: 'fixed'
    },
    // The actual cost value (250 for fixed, or custom amount)
    shippingCost: {
        type: Number,
        default: 250
    },
    // Threshold Settings
    isThresholdActive: {
        type: Boolean,
        default: true
    },
    thresholdValue: {
        type: Number,
        default: 7999
    },
    // Bank Deposit Message
    bankDepositMessage: {
        type: String,
        default: ''
    },
    updated: {
        type: Date,
        default: Date.now
    }
});

module.exports = Mongoose.model('Shipping', ShippingSchema);