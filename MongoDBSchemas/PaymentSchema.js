const mongoose = require('mongoose')
const paymentSchema = mongoose.Schema({
    cartId: { type: mongoose.Schema.ObjectId },
    isApproved: { type: Number },
    isPaid: { type: Number },
    productLocation: { type: String },
    receiverLocation: { type: String }
})
const Payment = mongoose.model('Payment', paymentSchema)

module.exports = Payment