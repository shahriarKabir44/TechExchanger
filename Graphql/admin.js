const graphql = require('graphql')
const bigint = require('graphql-bigint')
const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLSchema,
    GraphQLID,
    GraphQLInt,
    GraphQLList,
} = graphql;

var User = require('../models/User')
var Cart = require('../models/Cart')
var Notification = require('../models/Notification')
var Payment = require('../MongoDBSchemas/PaymentSchema')
var Product = require('../models/Product')


var user = new User()
var cart = new Cart()
var product = new Product()
var notification = new Notification()

const UserType = new GraphQLObjectType({
    name: 'User',
    fields: () => ({
        id: { type: GraphQLID },
        phoneNumber: { type: GraphQLString },
        email: { type: GraphQLString },
        address: { type: GraphQLString },
        imageURL: { type: GraphQLString },
        firstName: { type: GraphQLString, },
        lastName: { type: GraphQLString },
        notificationId: { type: GraphQLString },
        createdOn: { type: bigint },
        fullName: {
            type: GraphQLString,
            resolve(parent, args) {
                return parent.firstName + ' ' + parent.lastName
            }
        },
        Owned: {
            type: new GraphQLList(ProductType),
            resolve(parent, args) {
                return product.findMany({ owner: parent.id })
            }
        },
        Carts: {
            type: new GraphQLList(CartType),
            async resolve(parent, args) {
                return await cart.getCartsOfUser(parent.id)
            }
        },
        Notification: {
            type: new GraphQLList(NofiticationType),
            async resolve(parent, args) {
                var res = await notification.getNotificationsOfUser(parent.id)
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
        firstName: { type: GraphQLString, },
        lastName: { type: GraphQLString },
        imageURL: { type: GraphQLString },

        createdOn: { type: bigint },
        fullName: {
            type: GraphQLString,
            resolve(parent, args) {
                return parent.firstName + ' ' + parent.lastName
            }
        },
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
                return product.findById(parent.productId)
            }
        },
        Buyer: {
            type: UserType,
            resolve(parent, args) {
                //return user.findById(parent.customerId)
                return user.findOneById(parent.customerId)
            }
        },
        Seller: {
            type: UserType,
            resolve(parent, args) {
                //return user.findById(parent.ownerId)
                return user.findOneById(parent.ownerId)

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
        postedOn: { type: bigint },
        customerCount: { type: GraphQLInt },
        usedFor: { type: GraphQLString },
        postedFrom: { type: GraphQLString },

        Owner: {
            type: NormalUserType,
            resolve(parent, args) {
                //return user.findById(parent.owner)
                return user.findOneById(parent.owner)

            }
        },
        Offerers: {
            type: new GraphQLList(CartType),
            resolve(parent, args) {
                return cart.getCartsOfUser(parent.id)
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
                return user.findOneById(parent.senderId)
            }
        },
        Product: {
            type: ProductType,
            resolve(parent, args) {
                return product.findOne(parent.productId)
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
            async resolve(parent, args) {
                return await user.findOneById(args.id)

            }
        },
        Users: {
            type: new GraphQLList(NormalUserType),
            args: {
                pageNo: { type: GraphQLInt },
                pageSize: { type: GraphQLInt },
                firstName: { type: GraphQLString },
                lastName: { type: GraphQLString },
                phoneNumber: { type: GraphQLString },

            },
            async resolve(parent, args) {
                var users = await user.getMany(args)
                return users
            }
        },
        Products: {
            type: new GraphQLList(ProductType),
            resolve(pparent, args) {
                return product.findMany({})
            }
        },
        GetProductByCategory: {
            type: new GraphQLList(ProductType),
            args: {
                Type: { type: GraphQLString }
            },
            resolve(parent, args) {
                return product.findMany({ category: args.Type })
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
                return product.findMany(query)
            }
        },
        GetProductById: {
            type: ProductType,
            args: {
                id: { type: GraphQLID }
            },
            resolve(parent, args) {
                return product.findById(args.id)
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
                return cart.delete(query, args.productId)
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
                postedOn: { type: bigint },
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
                    return product.update({ _id: args.id }, currentProduct)
                }
                else {
                    if (await product.findById(args.id)) {
                        return product.delete(args)
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
