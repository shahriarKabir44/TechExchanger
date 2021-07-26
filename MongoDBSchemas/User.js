var mongoose = require('mongoose')

var userSchema = new mongoose.Schema({
    userName: { type: String, unique: true },
    password: { type: String },
    phoneNumber: { type: String },
    email: { type: String },
    address: { type: String },
    imageURL: { type: String },
    firstName: { type: String, },
    lastName: { type: String },
    notificationId: { type: String }
})

const User = mongoose.model('User', userSchema)
module.exports = User