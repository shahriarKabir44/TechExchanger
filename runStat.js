const DailyStat = require("./MongoDBSchemas/dailyStat");
const products = require("./MongoDBSchemas/Product");

module.exports = async function () {
    var dailyStat = await DailyStat.findOne({ identifier: "stat" })
    var currentTime = (new Date()) * 1
    if (!dailyStat) {
        var cheapest = await products.find({}).sort({ askedPrice: 1 }).limit(1)
        var popular = await products.find({}).sort({ customerCount: -1 }).limit(1)
        var newest = await products.find({}).sort({ usageNumber: 1 }).limit(1)

        var toSave = {
            least_price: JSON.stringify(cheapest[0]),
            least_used: JSON.stringify(newest[0]),
            most_popular: JSON.stringify(popular[0]),
            lastUpdated: currentTime
        }
        newData = new DailyStat(toSave)
        await newData.save()
        return toSave


    }
    else if (currentTime - dailyStat.lastUpdated * 1 >= 24 * 3600) {
        var cheapest = await products.find({}).sort({ askedPrice: 1 }).limit(1)
        var popular = await products.find({}).sort({ customerCount: -1 }).limit(1)
        var newest = await products.find({}).sort({ usageNumber: 1 }).limit(1)

        var toSave = {
            least_price: JSON.stringify(cheapest[0]),
            least_used: JSON.stringify(newest[0]),
            most_popular: JSON.stringify(popular[0]),
            lastUpdated: currentTime
        }
        var newData = await DailyStat.findOneAndUpdate({ identifier: "stat" }, toSave)
        return toSave
    }
    else {
        return dailyStat
    }

}