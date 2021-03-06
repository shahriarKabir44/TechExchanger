var cartSchema = require('../MongoDBSchemas/CartSchema')
var Notification = require('./Notification')
var User = require('./User')
var Product = require('./Product')

module.exports = function () {
    this.user = new User()
    this.product = new Product()
    return {
        create: async function (req) {
            var productName = req.body.productName
            var customerName = req.body.customerName
            var newCart = { ...req.body }
            delete newCart.productName
            delete newCart.customerName

            var updatedCart = await this.update({
                $and: [
                    { productId: req.body.productId },
                    { customerId: req.body.customerId }
                ]
            }, newCart)
            var now = (new Date() * 1) + ''
            if (!updatedCart) {
                var updatedCart = new cartSchema({ ...newCart, time: now, status: 0 })
                await this.product.update({ _id: req.body.productId }, { $inc: { customerCount: 1 } })
                await updatedCart.save()
            }
            var message = `${customerName} has offered ${req.body.offeredPrice} for your ${productName}!`;
            await Notification.create({
                senderId: req.body.customerId,
                receiverId: req.body.ownerId,
                category: 1,
                productId: req.body.productId,
                offer: req.body.offeredPrice,
                time: now,
            })
            await this.user.sendPushNotification(req.body.ownerId, { title: 'Offer!', body: message })
            return { data: updatedCart }
        },
        delete: async function (query, productId) {
            await this.product.update({ _id: productId }, { $inc: { customerCount: -1 } })
            return await cartSchema.findOneAndDelete(query)
        },
        update: async function (query, data) {
            var updatedCart = await cartSchema.findOneAndUpdate(query, data)
            return updatedCart
        },
        getCartsOfUser: async function (id) {
            return await cartSchema.find({ customerId: id })
        }
    }
}