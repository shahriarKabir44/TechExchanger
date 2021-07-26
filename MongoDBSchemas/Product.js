const mongoose = require('mongoose')

const prodct = mongoose.Schema({
    type: { type: String, },
    details: { type: String },
    image1: { type: String },
    image2: { type: String },
    image3: { type: String },
    image4: { type: String },
    askedPrice: { type: Number },
    owner: { type: mongoose.Schema.ObjectId },
    postedOn: { type: String },
    lastUpdated: { type: String }
})
const products = mongoose.model('products', prodct)

module.exports = products