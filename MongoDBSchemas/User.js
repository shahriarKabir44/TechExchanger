var mongoose = require('mongoose')

var userSchema = new mongoose.Schema({
    password: { type: String },
    phoneNumber: { type: String, unique: true },
    email: { type: String },
    address: { type: String },
    imageURL: { type: String },
    firstName: { type: String, },
    lastName: { type: String },
    notificationId: { type: String },
    createdOn: { type: String }
})

const User = mongoose.model('User', userSchema)
module.exports = User