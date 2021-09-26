const mongoose = require('mongoose')

const adminSchema = mongoose.Schema({

    userName: { type: String },
    password: { type: String },
    profilePicture: { type: String },
    phoneNumber: { type: String },
    email: { type: String },
    notificationString: { type: String }
})

const Admin = mongoose.model('admin', adminSchema)

module.exports = Admin