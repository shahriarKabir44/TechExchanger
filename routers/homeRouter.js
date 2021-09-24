const User = require('../models/User');
const Product = require('../models/Product')
const Cart = require('../MongoDBSchemas/Cart')
const Notification = require('../MongoDBSchemas/Notification');
const runStat = require('./runStat');
var jwt = require('jsonwebtoken')


const express = require('express')
var router = express.Router()
router.post('/subscribe', verifyAuthToken, async (req, res) => {
    const subscription = req.body
    var notificationId = (JSON.stringify(subscription))
    //res.status(201).json({})
    await User.updateGeneral(req.user.id, { notificationId: notificationId })
    var user = { ...req.user, notificationId: notificationId }
    var authHeader = jwt.sign(user, process.env.secret)


    webPush.sendNotification(JSON.parse(notificationId), JSON.stringify({ title: 'Hello!', body: 'Welcome to TechExchanger!' }))
        .then(notif => {
            res.send({
                data: {
                    user: user,
                    token: authHeader
                }
            })
        })
        .catch(err => console.log(err))



})

function verifyAuthToken(req, res, next) {
    var authHeader = req.headers['authorization']
    var token = authHeader && authHeader.split(' ')[1]
    if (!token) res.send({ data: null })
    else {
        jwt.verify(token, process.env.secret, (err, user) => {
            if (err) {
                res.send({
                    data: {
                        unauthorized: true
                    }
                })
            }
            else {
                req.user = user
                next()
            }
        })
    }
}
router.post('/updateUser', verifyAuthToken, async (req, res) => {
    var data = await User.updateInfo(req.body)
    res.send({ data: data })

})

router.get('/product/:id', async (req, res) => {
    var id = req.params.id
    try {
        if (await Product.findById(id)) {
            res.render('mainSite/productPage.ejs')
        }

        else res.redirect('/')
    } catch (error) {
        res.redirect('/')
    }

})

router.post('/addToCart', verifyAuthToken, async (req, res) => {
    var productName = req.body.productName
    var customerName = req.body.customerName
    var newCart = { ...req.body }
    delete newCart.productName
    delete newCart.customerName
    var updatedCart = await Cart.findOneAndUpdate({
        $and: [
            { productId: req.body.productId },
            { customerId: req.body.customerId }
        ]
    }, newCart)
    var now = (new Date() * 1) + ''
    if (!updatedCart) {
        var updatedCart = new Cart({ ...newCart, time: now, status: 0 })
        await Product.findByIdAndUpdate(req.body.productId, { $inc: { customerCount: 1 } })
        await updatedCart.save()
    }
    var message = `${customerName} has offered ${req.body.offeredPrice} for your ${productName}!`;
    var newNotification = new Notification({
        senderId: req.body.customerId,
        receiverId: req.body.ownerId,
        category: 1,
        productId: req.body.productId,
        offer: req.body.offeredPrice,
        time: now,
    })
    await newNotification.save()
    var seller = await User.findById(req.body.ownerId)
    var sellerNotificationId = seller.notificationId
    if (sellerNotificationId != '')
        webPush.sendNotification(JSON.parse(sellerNotificationId), JSON.stringify({ title: 'Offer!', body: message }))
            .then(data => {
                res.send({ data: updatedCart })
            })
            .catch(err => console.log(sellerNotificationId))
    else res.send({ data: updatedCart })
})
router.post('/login', async (req, res) => {

    var data = await User.login(req.body)
    res.send(data)
})
router.post('/postAd', verifyAuthToken, async (req, res) => {
    var newProduct = await Product.create(req)
    res.send(newProduct)
})
router.post('/updateProduct', verifyAuthToken, async (req, res) => {
    var updatedProduct = await Product.update(req)
    res.send(updatedProduct)
})
router.post('/isAuthorized', verifyAuthToken, (req, res) => {
    var user = req.user;
    res.send({ data: user })
})
router.get('/getStat', (req, res) => {
    runStat()
        .then(stat => {
            res.send({ data: stat })
        })
})
router.post('/signup', async (req, res) => {
    var newUser = req.body
    var data = await User.create(newUser)
    res.send(data)
})
router.get('/', (req, res) => {
    res.render('mainSite/index.ejs')
})
router.post('/logout', verifyAuthToken, (req, res) => {

    User.updateGeneral(req.user.id, { notificationId: '' })
        .then(data => {
            res.send(data)
        })
})
router.post('/updateProfilePicture', verifyAuthToken, async (req, res) => {
    var data = await User.updateImage(req)
    res.send(data)
})

module.exports = router