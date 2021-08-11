const express = require('express');
const graphqlHTTP = require('express-graphql');
const mongoose = require('mongoose');



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
    const homeRouter = require('./routers/homeRouter')

    app.use(cors())
    app.use(express.json())
    var PORT = process.env.PORT || 3000;
    app.listen(PORT)
    var path = require('path')
    app.use(express.static(__dirname + '/public'));
    app.use('/product/:id', express.static(__dirname + '/public'));
    app.use('/admin/:param', express.static(__dirname + '/adminStaticFiles'));
    app.set('view engine', 'ejs')

    app.use('/', homeRouter)
    app.use('/epstein', require('./routers/adminRouter'))

    app.use('/graphql', graphqlHTTP.graphqlHTTP(req => (
        {
            schema: graphqlSchema,
            graphiql: true
        }
    )));

}