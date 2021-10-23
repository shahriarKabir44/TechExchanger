const express = require('express');
const graphqlHTTP = require('express-graphql');
const mongoose = require('mongoose');
var jwt = require('jsonwebtoken')



require('dotenv').config()
var graphqlSchema = require('./Graphql/public')
var graphQLAdmin = require('./Graphql/admin')
var cors = require('cors')

mongoose.connect(process.env.CONNECTION_STRING,
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


function verifyAuthTokenAdmin(req, res, next) {
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

function startExpress() {
    const app = express();

    app.use(cors())
    app.use(express.json())
    var PORT = process.env.PORT || 3000;
    app.listen(PORT)
    app.use(express.static(__dirname + '/public'));
    app.use('/product/:id', express.static(__dirname + '/public'));
    app.use('/admin/:param', express.static(__dirname + '/adminStaticFiles'));
    app.set('view engine', 'ejs')

    app.use('/', require('./routers/homeRouter'))
    app.use('/epstein', require('./routers/adminRouter'))

    app.use('/graphql', graphqlHTTP.graphqlHTTP(req => (
        {
            schema: graphqlSchema,
            graphiql: true
        }
    )));

    app.use('/epstein/biden', graphqlHTTP.graphqlHTTP(req => (
        {
            schema: graphQLAdmin,
            graphiql: true
        }
    )))
}