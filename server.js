const express = require('express');
const graphqlHTTP = require('express-graphql');
const mongoose = require('mongoose');
var jwt = require('jsonwebtoken')
const session = require('express-session')
const webPush = require('web-push')
require('dotenv').config()
webPush.setVapidDetails('mailto:abc@def.com', public_key, private_key)



mongoose.connect('mongodb+srv://meme_lord:1234@cluster0.3sx7v.mongodb.net/TechExchanger?retryWrites=true&w=majority',
    {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
        useFindAndModify: false
    })


const cluster = require('cluster');
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
    app.use(express.static('public'))
    app.use(session({
        name: 'eeofbweifb',
        secret: process.env.secret,
        resave: false,
        saveUninitialized: true,
        cookie: {
            maxAge: (1000 * 60 * 100)
        }
    }));
    app.use(express.json())
    var PORT = process.env.PORT || 4000;
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
    app.use('/graphql', verifyAuthToken, graphqlHTTP.graphqlHTTP(req => (
        {
            schema: graphqlSchema,
            graphiql: true,
            context: { req }
        }
    )));

}