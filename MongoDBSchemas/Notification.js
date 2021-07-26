const mongoose = require('mongoose')
const notificationSchema = mongoose.Schema({
    senderId: { type: mongoose.Schema.ObjectId },
    recieverId: { type: mongoose.Schema.ObjectId },
    type: { type: Number },
    productId: { type: mongoose.Schema.ObjectId },
    offer: { type: Number },
    time: { type: String }
})
const Notification = mongoose.model('Notification', notificationSchema)

module.exports = Notification