const Mongoose = require('mongoose');
const { Schema } = Mongoose;
const slug = require('mongoose-slug-generator');

const options = {
    separator: '-',
    lang: 'en',
    truncate: 120
};

Mongoose.plugin(slug, options);
const PolicySchema = new Schema({
    type: {
        type: String,
        default: 'shipping', // 'shipping', 'return', 'privacy'
        unique: true
    },
    content: {
        type: String,
        required: true
    },
    updated: {
        type: Date,
        default: Date.now
    }
});

module.exports = Mongoose.model('Policy', PolicySchema);