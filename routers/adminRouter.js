const express = require('express')
var jwt = require('jsonwebtoken')

var Admin = require('../MongoDBSchemas/admin')

const router = express.Router()
function verifyAuthToken(req, res, next) {
    var authHeader = req.headers['jeffreyEpstein']
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
router.get('/', (req, res) => {
    res.render('admin/admin.ejs')
})
router.get('/isAuthorized', verifyAuthToken, (req, res) => {
    console.log('e')
    res.send({ user: req.user })
})

router.post('/login', async (req, res) => {
    var { userName, password } = req.body
    var admin = await Admin.findOne({
        $and: [
            { userNmae: userName },
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