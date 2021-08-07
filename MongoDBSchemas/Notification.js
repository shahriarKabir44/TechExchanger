const mongoose = require('mongoose')

const notificationSchema = mongoose.Schema({
    senderId: { type: mongoose.Schema.ObjectId },
    receiverId: { type: mongoose.Schema.ObjectId },
    category: { type: Number },
    productId: { type: mongoose.Schema.ObjectId },
    offer: { type: Number },
    time: { type: String },
})
const Notification = mongoose.model('Notification', notificationSchema)

module.exports = Notification