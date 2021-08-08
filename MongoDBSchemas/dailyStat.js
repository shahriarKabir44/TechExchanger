const mongoose = require('mongoose')

const statSchema = mongoose.Schema({
    least_price: { type: String },
    least_used: { type: String },
    most_popular: { type: String },
    identifier: { type: String, default: "stat" },
    lastUpdated: { type: String }
})

const DailyStat = mongoose.model('dailySat', statSchema)

module.exports = DailyStat