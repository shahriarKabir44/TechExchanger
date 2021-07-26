const mongoose = require('mongoose')
const paymentSchema = mongoose.Schema({
    cartId: { type: mongoose.Schema.ObjectId },
    isApproved: { type: number },
    isPaid: { type: number },
    productLocation: { type: string },
    receiverLocation: { type: string }
})
const Payment = mongoose.model('Payment', paymentSchema)

module.exports = Payment