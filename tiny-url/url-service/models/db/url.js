const mongoose = require('mongoose');

const UrlSchema = new mongoose.Schema({
    s: {
        type: String,
        unique: true,
        required: true,
    },
    l: {
        type: String,
        unique: true,
        required: true,
    },
    created: {
        type: Number,
        required: true,
        default: () => Date.now(),
    },
    expire: {
        type: Number,
        default: () => Date.now() + 365*24*60*60*1000,
    }
});

const Url = mongoose.model('url', UrlSchema, 'url');

module.exports = Url;