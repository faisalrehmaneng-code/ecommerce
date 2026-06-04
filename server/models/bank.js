const Mongoose = require('mongoose');
const { Schema } = Mongoose;

const BankSchema = new Schema({
    bankName: {
        type: String,
        required: true
    },
    accountTitle: {
        type: String,
        required: true
    },
    accountNumber: {
        type: String,
        required: true
    },
    iban: {
        type: String
    },
    isActive: {
        type: Boolean,
        default: true
    },
    updated: Date,
    created: {
        type: Date,
        default: Date.now
    }
});

module.exports = Mongoose.model('Bank', BankSchema);