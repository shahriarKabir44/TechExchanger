const graphql = require('graphql')
const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLSchema,
    GraphQLID,
    GraphQLInt,
    GraphQLList,
    GraphQLNonNull

} = graphql;

var User = require('../models/User')
var Cart = require('../models/Cart')
var Notification = require('../models/Notification')
var Payment = require('../MongoDBSchemas/PaymentSchema')
var Product = require('../models/Product')

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
                return Product.findMany({ owner: parent.id })
            }
        },
        Carts: {
            type: new GraphQLList(CartType),
            async resolve(parent, args) {
                var x = await Cart.getCartsOfUser(parent.id)
                return x
            }
        },
        Notification: {
            type: new GraphQLList(NofiticationType),
            async resolve(parent, args) {
                var res = await Notification.getNotificationsOfUser(parent.id)
                return res
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
        offeredPrice: { type: GraphQLInt },
        status: { type: GraphQLInt },
        time: { type: GraphQLString },
        whereToReceive: { type: GraphQLString },
        Product: {
            type: ProductType,
            resolve(parent, args) {
                return Product.findById(parent.productId)
            }
        },
        Buyer: {
            type: UserType,
            resolve(parent, args) {
                return User.findOneById(parent.customerId)
            }
        },
        Seller: {
            type: UserType,
            resolve(parent, args) {
                return User.findOneById(parent.ownerId)
            }
        }
    })
});

const ProductType = new GraphQLObjectType({
    name: 'Product',
    fields: () => ({
        id: { type: GraphQLID },
        category: { type: GraphQLString, },
        details: { type: GraphQLString },
        image1: { type: GraphQLString },
        image2: { type: GraphQLString },
        image3: { type: GraphQLString },
        image4: { type: GraphQLString },
        askedPrice: { type: GraphQLInt },
        owner: { type: GraphQLID },
        postedOn: { type: GraphQLInt },
        customerCount: { type: GraphQLInt },
        usedFor: { type: GraphQLString },
        postedFrom: { type: GraphQLString },

        Owner: {
            type: NormalUserType,
            resolve(parent, args) {
                return User.findOneById(parent.owner)
            }
        },
        Offerers: {
            type: new GraphQLList(CartType),
            resolve(parent, args) {
                return Cart.getCartsOfUser(parent.id)
            }
        }
    })
});

const NofiticationType = new GraphQLObjectType({
    name: 'Nofitication',
    fields: () => ({
        id: { type: GraphQLID },
        senderId: { type: GraphQLID },
        receiverId: { type: GraphQLID },
        category: { type: GraphQLInt },
        productId: { type: GraphQLID },
        offer: { type: GraphQLInt },
        time: { type: GraphQLString },
        Sender: {
            type: NormalUserType,
            resolve(parent, args) {
                return User.findOneById(parent.senderId)
            }
        },
        Product: {
            type: ProductType,
            resolve(parent, args) {
                return Product.findById(parent.productId)
            }
        }
    })
});

const RootQueryType = new GraphQLObjectType({
    name: 'rootquery',
    fields: {
        User: {
            type: UserType,
            args: { id: { type: GraphQLID } },
            resolve(parent, args) {
                return User.findOneById(args.id)
            }
        },
        Products: {
            type: new GraphQLList(ProductType),
            resolve(pparent, args) {
                return Product.findMany({})
            }
        },
        GetProductByCategory: {
            type: new GraphQLList(ProductType),
            args: {
                Type: { type: GraphQLString }
            },
            resolve(parent, args) {
                return Product.findMany({ category: args.Type })
            }
        },
        SearchProducts: {
            type: new GraphQLList(ProductType),
            args: {
                type: { type: GraphQLString },
                askedPrice: { type: GraphQLString }
            },
            resolve(parent, args) {
                var query = {
                    $and: []
                }
                if (args.type != "") query.$and.push({ type: args.type })
                if (args.price) query.$and.push({ askedPrice: { $gte: args.askedPrice } })
                return Product.findMany(query)
            }
        },
        GetProductById: {
            type: ProductType,
            args: {
                id: { type: GraphQLID }
            },
            resolve(parent, args) {
                return Product.findById(args.id)
            }
        }
    }
})

const Mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        CartDelete: {
            type: CartType,
            args: {
                productId: { type: GraphQLID },
                customerId: { type: GraphQLID },
            },
            async resolve(parent, args) {

                var query = {
                    $and: [
                        { productId: args.productId },
                        { customerId: args.customerId }
                    ]
                }
                return Cart.delete(query, args.productId)
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
                postedOn: { type: GraphQLInt },
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
                    return Product.update({ _id: args.id }, currentProduct)
                }
                else {
                    if (await Product.findById(args.id)) {

                        return Product.delete(args.id)
                    }
                }
            }
        }
    }
})

module.exports = new GraphQLSchema({
    query: RootQueryType,
    mutation: Mutation
});
