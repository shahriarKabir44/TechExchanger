const mongoose = require('mongoose')

const prodct = mongoose.Schema({
    category: { type: String, },
    details: { type: String },
    image1: { type: String },
    image2: { type: String },
    image3: { type: String },
    image4: { type: String },
    askedPrice: { type: Number },
    owner: { type: mongoose.Schema.ObjectId },
    postedOn: { type: Number },
    lastUpdated: { type: String },
    customerCount: { type: Number, default: 0 },
    usedFor: { type: String },
    postedFrom: { type: String },
    usageNumber: { type: Number }
})
const products = mongoose.model('products', prodct)

module.exports = products