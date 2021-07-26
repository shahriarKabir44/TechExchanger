const graphql = require('graphql')
const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLSchema,
    GraphQLID,
    GraphQLInt,
    GraphQLList,
    GraphQLNonNull,

} = graphql;

var User = require('../MongoDBSchemas/User')
var Cart = require('../MongoDBSchemas/Cart')
var Notification = require('../MongoDBSchemas/Notification')
var Payment = require('../MongoDBSchemas/Payment')
var Product = require('../MongoDBSchemas/Product')

const UserType = new GraphQLObjectType({
    name: 'User',
    fields: () => ({
        id: { type: GraphQLID },
        userName: { type: GraphQLString },
        phoneNumber: { type: GraphQLString },
        email: { type: GraphQLString },
        address: { type: GraphQLString },
        imageURL: { type: GraphQLString },
        firstName: { type: GraphQLString, },
        lastName: { type: GraphQLString },
        notificationId: { type: GraphQLString },
        Owned: {
            type: new GraphQLList(ProductType),
            resolve(parent, args) {
                return Product.find({ owner: parent.id })
            }
        },
        Carts: {
            type: new GraphQLList(CartType),
            resolve(parent, args) {
                return Cart.find({ customerId: parent.id })
            }
        },
        Notification: {
            type: new GraphQLList(NofiticationType),
            resolve(parent, args) {
                return Notification.find({ recieverId: parent.id })
            }
        }
    })
});
const NormalUserType = new GraphQLObjectType({
    name: 'NormalUser',
    fields: () => ({
        id: { type: GraphQLID },
        userName: { type: GraphQLString },
        phoneNumber: { type: GraphQLString },
        email: { type: GraphQLString },
        address: { type: GraphQLString },
        imageURL: { type: GraphQLString },
        firstName: { type: GraphQLString, },
        lastName: { type: GraphQLString },
        notificationId: { type: GraphQLString }

    })
});

const CartType = new GraphQLObjectType({
    name: 'Cart',
    fields: () => ({
        id: { type: GraphQLID },
        ownerId: { type: GraphQLID },
        productId: { type: GraphQLID },
        customerId: { type: GraphQLID },
        offeredPrice: { type: GraphQLString },
        status: { type: GraphQLInt },
        time: { type: GraphQLString },
        Product: {
            type: ProductType,
            resolve(parent, args) {
                return Product.findById(parent.productId)
            }
        },
        Buyer: {
            type: ProductType,
            resolve(parent, args) {
                return User.findById(parent.ownerId)
            }
        },
        Seller: {
            type: ProductType,
            resolve(parent, args) {
                return user.findById(parent.customerId)
            }
        }
    })
});

const ProductType = new GraphQLObjectType({
    name: 'Product',
    fields: () => ({
        id: { type: GraphQLID },
        type: { type: GraphQLString, },
        details: { type: GraphQLString },
        image1: { type: GraphQLString },
        image2: { type: GraphQLString },
        image3: { type: GraphQLString },
        image4: { type: GraphQLString },
        askedPrice: { type: GraphQLInt },
        owner: { type: GraphQLID },
        postedOn: { type: GraphQLString },
        Owner: {
            type: NormalUserType,
            resolve(parent, args) {
                return User.findById(parent.owner)
            }
        },
        Offerers: {
            type: new GraphQLList(CartType),
            resolve(parent, args) {
                return Cart.find({ productId: parent.id })
            }
        }
    })
});

const NofiticationType = new GraphQLObjectType({
    name: 'Nofitication',
    fields: () => ({
        id: { type: GraphQLID },
        senderId: { type: GraphQLID },
        recieverId: { type: GraphQLID },
        type: { type: GraphQLInt },
        productId: { type: GraphQLID },
        offer: { type: GraphQLInt },
        time: { type: GraphQLString }
    })
});

const RootQueryType = new GraphQLObjectType({
    name: 'rootquery',
    fields: {
        User: {
            type: UserType,
            args: { id: { type: GraphQLID } },
            resolve(parent, args) {
                return User.findById(args.id)
            }
        },
        Products: {
            type: new GraphQLList(ProductType),
            resolve(pparent, args) {
                return Product.find({})
            }
        }
    }
})

const Mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        CartAddDeleteEdit: {
            type: CartType,
            args: {
                ownerId: { type: GraphQLID },
                productId: { type: GraphQLID },
                customerId: { type: GraphQLID },
                offeredPrice: { type: GraphQLString },
                actionType: { type: GraphQLInt },
                status: { type: GraphQLInt }
            },
            async resolve(parent, args) {
                var newCart = {
                    ...args
                }
                var query = {
                    $and: [
                        { productId: args.productId },
                        { customerId: args.customerId }
                    ]
                }
                delete newCart.actionType
                if (args.actionType == 0) {
                    var newcartToSave = new cart({
                        ...newCart,
                        time: (new Date() * 1) + ''
                    })

                    var updateddata = await Cart.findOneAndUpdate(
                        query, newcartToSave
                    )
                    if (!updateddata) {
                        return newCart.save()
                    }
                    else return updateddata
                }
                else {
                    return Cart.findOneAndDelete(query)
                }
            }
        },
        ProductEditDelete: {
            type: ProductType,
            args: {
                id: { type: GraphQLID },
                type: { type: GraphQLString, },
                details: { type: GraphQLString },
                image1: { type: GraphQLString },
                image2: { type: GraphQLString },
                image3: { type: GraphQLString },
                image4: { type: GraphQLString },
                askedPrice: { type: GraphQLInt },
                owner: { type: GraphQLID },
                postedOn: { type: GraphQLString },
                actionType: { type: GraphQLInt }
            },
            async resolve(parent, args) {
                var currentProduct = {
                    ...args,
                    lastUpdated: (new Date() * 1) + ''
                }
                delete currentProduct.actionType
                delete currentProduct.id
                if (args.actionType) {
                    return Product.findByIdAndUpdate(args.id, currentProduct)
                }
                else {
                    if (await Product.findById(args.id)) {
                        var carts = await Cart.find({ productId: args.id })
                        for (let cart of carts) {
                            Cart.findByIdAndDelete(cart.id)
                        }
                        return Product.findByIdAndDelete(args.id)
                    }
                }
            }
        },
        CreateProduct: {
            type: ProductType,
            args: {
                type: { type: GraphQLString, },
                details: { type: GraphQLString },
                image1: { type: GraphQLString },
                image2: { type: GraphQLString },
                image3: { type: GraphQLString },
                image4: { type: GraphQLString },
                askedPrice: { type: GraphQLInt },
                owner: { type: GraphQLID },
            },
            resolve(parent, args) {
                var newProduct = new Product({
                    ...args
                })
                return newProduct.save()
            }
        }
    }
})

module.exports = new GraphQLSchema({
    query: RootQueryType,
    mutation: Mutation
});
