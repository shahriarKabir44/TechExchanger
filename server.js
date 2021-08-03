const express = require('express');
const graphqlHTTP = require('express-graphql');
const mongoose = require('mongoose');
var jwt = require('jsonwebtoken')


const webPush = require('web-push')
require('dotenv').config()
webPush.setVapidDetails('mailto:abc@def.com', process.env.public_key, process.env.private_key)
var graphqlSchema = require('./Graphql/graphqlSchema')
var cors = require('cors')

mongoose.connect('mongodb+srv://meme_lord:1234@cluster0.3sx7v.mongodb.net/TechExchanger?retryWrites=true&w=majority',
    {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
        useFindAndModify: false
    })


const cluster = require('cluster');
const User = require('./MongoDBSchemas/User');
const Product = require('./MongoDBSchemas/Product')
const Cart = require('./MongoDBSchemas/Cart')
const Notification = require('./MongoDBSchemas/Notification')

const totalCPUs = require('os').cpus().length;

if (cluster.isMaster) {
    for (let i = 0; i < totalCPUs; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
        cluster.fork();
    });

} else {
    startExpress();
}



function startExpress() {
    const app = express();

    app.use(cors())
    app.use(express.json())
    var PORT = process.env.PORT || 3000;
    app.listen(PORT)
    var path = require('path')
    app.use(express.static(__dirname + '/public'));
    app.use('/product/:id', express.static(__dirname + '/public'));
    app.set('view engine', 'ejs')

    app.post('/subscribe', verifyAuthToken, async (req, res) => {
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
                    res.send({ data: null })
                }
                else {
                    req.user = user
                    next()
                }
            })
        }
    }
    app.post('/updateUser', verifyAuthToken, async (req, res) => {
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

    app.get('/product/:id', (req, res) => {
        console.log('object')
        res.render('productPage.ejs')
    })

    app.post('/addToCart', verifyAuthToken, async (req, res) => {
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
            var toSave = new Cart({ ...newCart, time: now, status: 0 })
            await Product.findByIdAndUpdate(req.body.productId, { $inc: { customerCount: 1 } })
            await toSave.save()
        }
        var message = `${customerName} has offered ${req.body.offeredPrice} for your ${productName}!`;
        var newNotification = new Notification({
            senderId: req.body.customerId,
            receiverId: req.body.ownerId,
            type: 1,
            productId: req.body.productId,
            offer: req.body.offeredPrice,
            time: now,
        })
        await newNotification.save()
        var sellerNotificationId = await User.findById(req.body.ownerId)
        webPush.sendNotification(JSON.parse(sellerNotificationId), JSON.stringify({ title: 'Offer!', body: message }))
            .then(data => {
                res.send({ data: newNotification })
            })
            .catch(err => console.log(err))
    })
    app.post('/login', async (req, res) => {
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
    app.post('/postAd', verifyAuthToken, async (req, res) => {
        var now = (new Date() * 1) + ''
        var newProd = new Product({ ...req.body, owner: req.user.id, postedOn: now })
        await newProd.save()
        res.send({ newProductid: newProd._id })
    })
    app.post('/updateProduct', verifyAuthToken, async (req, res) => {
        var id = req.body.id
        var newProd = { ...req.body }
        delete newProd.id
        var newpd = await Product.findByIdAndUpdate(id, newProd)
        res.send({ data: { ...newProd, id: id } })
    })
    app.post('/isAuthorized', verifyAuthToken, (req, res) => {
        var user = req.user;
        res.send({ data: user })
    })
    app.post('/signup', async (req, res) => {
        var newUser = req.body
        try {
            var toSave = new User(newUser)
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
    app.get('/', (req, res) => {
        res.render('index.ejs')
    })
    app.post('/logout', verifyAuthToken, (req, res) => {
        User.findByIdAndUpdate(req.user.id, { notificationId: '' }, (er, data) => {
            if (er) console.log(er)
            else res.send({ data: 1 })
        })
    })
    app.post('/updateProfilePicture', verifyAuthToken, async (req, res) => {
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

    app.use('/graphql', graphqlHTTP.graphqlHTTP(req => (
        {
            schema: graphqlSchema,
            graphiql: true
        }
    )));

}