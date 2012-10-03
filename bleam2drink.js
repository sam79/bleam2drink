var express = require('express');
var redis = require('redis');

var port = (process.env.VMC_APP_PORT || 3308);
var host = (process.env.VCAP_APP_HOST || 'localhost');

var redisPort = 10266;
var redisHost = 'cod.redistogo.com';
var redisPassword = '21b880c3b34bb4fe3f21f12b4036f5e3';

if (process.env.VCAP_SERVICES) {      
    var vcapServices = JSON.parse(process.env.VCAP_SERVICES);
    var cfRedis = vcapServices['redis-2.2'][0];  
    redisHost = cfRedis.credentials.hostname;
    redisPort = cfRedis.credentials.port;
    redisPassword = cfRedis.credentials.password;
}

var db = redis.createClient(redisPort, redisHost);

db.auth('21b880c3b34bb4fe3f21f12b4036f5e3', function (err) {
    if (err) { throw err; }
    console.log('Successully connected to redis');
    });

var app = express();
app.set('view engine', 'jade');

app.get('/', function(req, res) {
    res.send('Hello');
});

decrNbDrinks = function(day, drinkInit, ubCode, res) {
    db.setnx(day+':'+ubCode, drinkInit);
    db.decr(day+':'+ubCode, function(err, nbDrinks) {
	if (err) return err;
    	res.send(res.render('drink', {drink: nbDrinks<0?'STOP':nbDrinks+1}));
    });
}

app.get('/drink/day1/:ubcode', function(req, res) {
    decrNbDrinks("day1", 6, req.params.ubcode, res);
});

app.get('/drink/day2/:ubcode', function(req, res) {
    decrNbDrinks("day2", 10, req.params.ubcode, res);
});


resetByKey = function(key) {
    db.keys(key+':*', function(err, arrayOfKeys) {
	    arrayOfKeys.forEach(function(key) {
		    db.del(key, function(err, numRemoved) {
			    console.log("Removed " + key);
			});
		});
	});
}

app.post('/reset/day1', function(req, res) {
	resetByKey("day1");
    	res.send(200, "Reset OK");
});

app.post('/reset/day2', function(req, res) {
	resetByKey("day2");
        res.send(200, "Reset OK");
});

app.listen(port, host);
console.log('Listening on port ' + port);
