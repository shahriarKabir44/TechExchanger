var productSchema = require('../MongoDBSchemas/ProductSchema')
var cartSchema = require('../MongoDBSchemas/CartSchema')

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
    update: async function (query, data) {
        var newProd = { ...req.body }
        if (newProd.id)
            delete newProd.id
        var newpd = await productSchema.findOneAndUpdate(query, data)
        return { data: { ...newpd, ...data } }
    },

    delete: async function ({ id }) {
        var carts = await cartSchema.find({ productId: id })
        for (let cart of carts) {
            cartSchema.findByIdAndDelete(cart.id)
        }
        return productSchema.findByIdAndDelete(args.id)
    }
}