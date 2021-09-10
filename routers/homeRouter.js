const User = require('../MongoDBSchemas/User');
const Product = require('../MongoDBSchemas/Product')
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
    var newDat = await User.findByIdAndUpdate(req.user.id, { notificationId: notificationId })
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
    var { id, curPassword } = req.body
    if (req.body.toStore.password == "") {
        delete req.body.toStore.password
    }
    var realUser = await User.findById(id)

    if (realUser.password == curPassword) {
        var toSave = { ...req.body.toStore }
        await User.findByIdAndUpdate(id, toSave)
        toSave.id = id
        var user = { ...req.user, ...toSave }
        var token = jwt.sign(user, process.env.secret)
        res.send({
            data: {
                user: user,
                token: token
            }
        })
    }
    else {
        res.send({ data: null })
    }

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
    var { phoneNumber, password } = req.body;
    var data = await User.findOne({ $and: [{ phoneNumber: phoneNumber }, { password: password }] })
    if (data == null) res.send({ data: null })
    else {
        data.id = data._id
        delete data.password
        var toSend = {
            id: data.id,
            phoneNumber: data.phoneNumber,
            email: data.email,
            address: data.address,
            imageURL: data.imageURL,
            firstName: data.firstName,
            lastName: data.lastName,
            notificationId: data.notificationId,
        }
        var authHeader = jwt.sign(toSend, process.env.secret)
        res.send({
            data: {
                token: authHeader,
                user: toSend
            }
        })
    }
})
router.post('/postAd', verifyAuthToken, async (req, res) => {
    var now = (new Date() * 1) + ''
    var newProd = new Product({ ...req.body, owner: req.user.id, postedOn: now })
    await newProd.save()
    res.send({ newProductid: newProd._id })
})
router.post('/updateProduct', verifyAuthToken, async (req, res) => {
    var id = req.body.id
    var newProd = { ...req.body }
    delete newProd.id
    var newpd = await Product.findByIdAndUpdate(id, newProd)
    res.send({ data: { ...newProd, id: id } })
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
    try {
        var toSave = new User({ ...newUser, createdOn: (new Date() * 1) + '' })
        await toSave.save();
        var tempdata = {
            ...newUser,
            id: toSave._id
        }
        var token = jwt.sign(tempdata, process.env.secret)
        res.send({
            data: {
                token: token,
                user: tempdata
            }
        })
    } catch (error) {
        console.log(error)
        res.send({ data: null })
    }
})
router.get('/', (req, res) => {
    res.render('mainSite/index.ejs')
})
router.post('/logout', verifyAuthToken, (req, res) => {
    User.findByIdAndUpdate(req.user.id, { notificationId: '' }, (er, data) => {
        if (er) console.log(er)
        else res.send({ data: 1 })
    })
})
router.post('/updateProfilePicture', verifyAuthToken, async (req, res) => {
    var { id, imageURL } = req.body
    User.findByIdAndUpdate(id, { imageURL: imageURL }, async (err, data) => {
        if (err) console.log(err)
        else {
            var finalUser = await User.findById(id)
            var userToSave = { ...req.user, imageURL: finalUser.imageURL }
            var authToken = jwt.sign(userToSave, process.env.secret)
            res.send({
                data: {
                    token: authToken,
                    user: userToSave
                }
            })
        }
    })
})

module.exports = router