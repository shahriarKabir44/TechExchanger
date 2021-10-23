var productSchema = require('../MongoDBSchemas/ProductSchema')
var cartSchema = require('../MongoDBSchemas/CartSchema')

module.exports = function () {
    this.findById = async function (id) {
        return await productSchema.findById(id)
    }
    this.findOne = async function (filter) {
        return await productSchema.findOne(filter)
    }
    this.findMany = async function (filter) {
        return await productSchema.find(filter)
    }
    this.create = async function (req) {
        var now = (new Date() * 1)
        var newProd = new productSchema({ ...req.body, owner: req.user.id, postedOn: now })
        await newProd.save()
        return ({ newProductid: newProd._id })
    }
    this.update = async function (query, data) {
        var newProd = { ...req.body }
        if (newProd.id)
            delete newProd.id
        var newpd = await productSchema.findOneAndUpdate(query, data)
        return { data: { ...newpd, ...data } }
    }

    this.delete = async function ({ id }) {
        var carts = await cartSchema.find({ productId: id })
        for (let cart of carts) {
            cartSchema.findByIdAndDelete(cart.id)
        }
        return productSchema.findByIdAndDelete(args.id)
    }

}

