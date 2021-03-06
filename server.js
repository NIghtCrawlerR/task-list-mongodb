const express = require('express'),
    app = require('express')(),
    path = require('path'),
    http = require('http').Server(app),
    MongoClient = require('mongodb').MongoClient,
    objectId = require("mongodb").ObjectID

//Connect database
//var dbUrl = 'mongodb://NightCrawler:F9V6U0XxMmOZEVeA@ds137404.mlab.com:37404/chat'
var dbUrl = 'mongodb://NightCrawler:F9V6U0XxMmOZEVeA@ds141284.mlab.com:41284/task-app'
var db


const jsonParser = express.json();

app.set('view engine', 'ejs')
//Set static folder
app.use(express.static(path.join(__dirname, 'public')))

app.get('/', (req, res) => {
    var app = {}
    //   db.collection('cards').createIndex({'index': 1})
    db.collection('cards').find().sort({ 'index': 1 }).toArray((err, result) => {
        app['cards'] = result
    })
    db.collection('badges').find().sort({ 'index': 1 }).toArray((err, result) => {
        app['badges'] = result
        res.render('index.ejs', {cards: app['cards'], badges: app['badges']})
    })
})

app.get('/cards/:id', (req, res) => {
    const id = new objectId(req.params.id);

    db.collection('cards').findOne({ _id: id }, (err, card) => {
        if (err) return console.log(err)
        res.send(card)
    })
})

app.post('/cards', jsonParser, (req, res) => {
    var card = req.body.data
    db.collection('cards').insertOne(card, function (err, result) {
        if (err) return console.log(err);
        res.send(card);
    });
})

app.post('/badges', jsonParser, (req, res) => {
    const id = new objectId('5c54964d08ebae10c00819d9')
    let data = req.body
    db.collection('badges').findOneAndUpdate({ type: 'badges' }, { $set: data }, { returnOriginal: false }, (err, result) => {
        res.send(result.value)
    })
})

app.put('/cards/:id', jsonParser, (req, res) => {
    if (!req.body) return res.sendStatus(400);
    const id = new objectId(req.params.id)
    var data = req.body.data
    db.collection('cards').findOneAndUpdate({ _id: id }, { $set: data }, { returnOriginal: false }, (err, result) => {
        res.send(result.value)
    })
})

//save cards order
app.put('/cards', jsonParser, (req, res) => {
    if (!req.body) return res.sendStatus(400);
    req.body.map((id, i) => {
        db.collection('cards').findOneAndUpdate({ _id: objectId(id) }, { $set: { 'index': i } })
    })
})

app.delete('/cards/:id', (req, res) => {
    console.log(req.params.id)
    const id = new objectId(req.params.id);
    db.collection('cards').findOneAndDelete({ _id: id }, function (err, result) {
        if (err) return console.log(err)
        res.send(result)
    })
})

MongoClient.connect(dbUrl, { useNewUrlParser: true }, (err, client) => {
    if (err) return console.log(err)
    db = client.db('task-app')
    app.listen(3000, function () {
        console.log('listening on *:3000');
    });
})


// прослушиваем прерывание работы программы (ctrl-c)
process.on("SIGINT", () => {
    db.close();
    process.exit();
});