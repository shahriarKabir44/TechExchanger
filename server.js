const express = require('express');
const graphqlHTTP = require('express-graphql');
const mongoose = require('mongoose');
var jwt = require('jsonwebtoken')
const session = require('express-session')
const webPush = require('web-push')
require('dotenv').config()
webPush.setVapidDetails('mailto:abc@def.com', process.env.public_key, process.env.private_key)
var graphqlSchema = require('./Graphql/graphqlSchema')


mongoose.connect('mongodb+srv://meme_lord:1234@cluster0.3sx7v.mongodb.net/TechExchanger?retryWrites=true&w=majority',
    {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
        useFindAndModify: false
    })


const cluster = require('cluster');
const User = require('./MongoDBSchemas/User');
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
    app.use(express.static('public'))

    app.use(express.json())
    var PORT = process.env.PORT || 3000;
    app.listen(PORT)




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
        res.sendFile('index.html')
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
    app.use('/graphql', verifyAuthToken, graphqlHTTP.graphqlHTTP(req => (
        {
            schema: graphqlSchema,
            graphiql: true,
            context: { req }
        }
    )));

}