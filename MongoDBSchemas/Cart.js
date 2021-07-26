const mongoose = require('mongoose')

const cartSchema = mongoose.Schema({
    ownerId: { type: mongoose.Schema.ObjectId },
    productId: { type: mongoose.Schema.ObjectId },
    customerId: { type: mongoose.Schema.ObjectId },
    offeredPrice: { type: Number },
    status: { type: Number },
    time: { type: String }
})

const Cart = mongoose.model('Cart', cartSchema)

module.exports = Cart