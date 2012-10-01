var express = require('express');
var redis = require('redis');
var db = redis.createClient();
var app = express();

app.use(function(req, res) {
    var ubCode = req.ubCode;
    db.setnx(ubCode, 6);
    db.decr(function(err, nbDrinks) {
        if (err) return err;
        req.drinks = nbDrinks;
    });
});

app.get('/drink', function(req, res) {
    res.send(req.drinks + ' drinks remaining');
});

app.listen(3300);
console.log('Listening on port 3300');