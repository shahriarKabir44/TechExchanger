const express = require('express')
var jwt = require('jsonwebtoken')

var Admin = require('../MongoDBSchemas/AdminSchema')
const products = require('../MongoDBSchemas/ProductSchema')
const User = require('../MongoDBSchemas/UserSchema')

const router = express.Router()
function verifyAuthToken(req, res, next) {
    var authHeader = req.headers['jeffreyepstein']
    var token = authHeader && authHeader.split(' ')[1]
    if (!token) res.send({ data: null })
    else {
        jwt.verify(token, process.env.secret, (err, user) => {
            if (err) {
                res.send({
                    data: null
                })
            }
            else {
                req.user = user._doc
                next()
            }
        })
    }
}
router.get('/', (req, res) => {
    res.render('admin/admin.ejs')
})
router.get('/isAuthorized', verifyAuthToken, (req, res) => {
    res.send({
        data: {
            user: req.user
        }
    })
})

router.get('/countEntities/:id', verifyAuthToken, (req, res) => {
    var type = req.params.id
    if (type) {
        User.countDocuments({}, (err, data) => {
            if (err) throw err
            else res.send({ data: data })
        })
    }
    else {
        products.countDocuments({}, (err, data) => {
            if (err) throw err
            else res.send({ data: data })
        })
    }
})

router.post('/login', async (req, res) => {
    var { userName, password } = req.body
    var admin = await Admin.findOne({
        $and: [
            { userName: userName },
            { password: password }
        ]
    })
    if (!admin) {
        res.send({ data: null })
    }
    else {
        var newAdmin = { ...admin, password: null }
        var token = jwt.sign(newAdmin, process.env.secret)
        res.send({
            data: {
                user: newAdmin,
                token: token
            }
        })
    }
})


module.exports = router