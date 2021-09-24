var productSchema = require('../MongoDBSchemas/Product')
var cartSchema = require('../MongoDBSchemas/Cart')

module.exports = {
    findById: async function (id) {
        return await productSchema.findById(id)
    },
    findOne: async function (filter) {
        return await productSchema.findOne(filter)
    },
    findMany: async function (filter) {
        return await productSchema.find(filter)
    },
    create: async function (req) {
        var now = (new Date() * 1) + ''
        var newProd = new productSchema({ ...req.body, owner: req.user.id, postedOn: now })
        await newProd.save()
        return ({ newProductid: newProd._id })
    },
    update: async function (req) {
        var id = req.body.id
        var newProd = { ...req.body }
        delete newProd.id
        var newpd = await productSchema.findByIdAndUpdate(id, newProd)
        return { data: { ...newProd, id: id } }
    },
    delete: async function ({ id }) {
        var carts = await cartSchema.find({ productId: id })
        for (let cart of carts) {
            cartSchema.findByIdAndDelete(cart.id)
        }
        return productSchema.findByIdAndDelete(args.id)
    }
}