var express = require('express');
var bodyParser = require('body-parser');
var validator = require('validator');
var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

var mongoUri = process.env.MONGOLABURI || process.env.MONGOHQ_URL || 'mongodb://heroku_8h7s37g1:ko07p4amkieo3b2a9l9c026j72@ds047075.mlab.com:47075/heroku_8h7s37g1';
var MongoClient = require('mongodb').MongoClient, format = require('util').format;
var db = MongoClient.connect(mongoUri, function(error, databaseConnection) {
	db = databaseConnection;
});

app.use(express.static(__dirname + '/public'));
app.use(function(req, res, next) {
  	res.header("Access-Control-Allow-Origin", "*");
  	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  	next();
});

app.post('/search', function(request, response) {
    var userID = parseFloat(request.body.userID);
    var start = request.body.startpoint;
    var end = request.body.endpoint;
    var foodtype = request.body.foodtype;
    var d = new Date();
    var toInsert = {
        "userID": userID,
        "foodtype": foodtype,
        "startpoint": start,
        "endpoint" : end,
        "date" : d
    };
    db.collection('searches', function(error, coll) {
        var id = coll.insert(toInsert, function(error, saved) {
            if (!error) {
                response.sendStatus(200);
            }
            else {
                response.sendStatus(500);
            }
        });
    });
});

app.get('/past', function(request, response) {
    db.collection('searches', function(er, collection) {
            collection.find({userID: parseFloat(request.query.userID)}).toArray(function(err, cursor) {
                if (!err) {
                    response.send(cursor);
                } else {
                    response.sendStatus(500);
                }
            });
    });
});

// views is directory for all template files
app.set('views', __dirname +  '/public');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  	response.render('index.html');
});

app.listen(process.env.PORT || 3000);
