var express = require('express');
var bodyParser = require('body-parser');
var validator = require('validator');
var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));


var mongoUri = process.env.MONGOLABURI || process.env.MONGOHQ_URL || 'mongodb:local/mongodb://heroku_8h7s37g1:ko07p4amkieo3b2a9l9c026j72@ds047075.mlab.com:47075/heroku_8h7s37g1';
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

app.post('/search', function(request, response, next) {
       // console.log('shree');
        var user = request.body.userID;
        //console.log(user);
        var start = request.body.startpoint;
       // console.log(start);
        var end = request.body.endpoint;
//console.log(end);
        var food = request.body.foodtype;
       // console.log(food);
        //var d = new Date();
        var toInsert = {
                "userID": user,
                "foodtype": food,
                //"startpoint": start,
                //"endpoint" : end,
               // "date" : d
        };
        db.collection('searches', function(error, coll) {
                var id = coll.insert(toInsert, function(error, saved) {
                        if (error) {
                                response.send(500);
                        }
                        else {
                                response.send(200);
                        }
            });
        });
});


app.get('/past', function(request, response, next) {
        response.set('Content-Type', 'text/html');
        var indexPage = '';
        db.collection('searches', function(er, collection) {
                collection.find({"userID": request.body.userID}).toArray(function(err, cursor) {
                        if (!err) {
                                indexPage += "<!DOCTYPE HTML><html><head><title>Past Searches</title></head><body><h1>Past Travels</h1>";
                                for (var count = 0; count < cursor.length; count++) {
                                        indexPage += "<p>Search for" + cursor[count].foodtype
                                        /*+ cursor[count].startpoint + "to" + cursor[count].endpoint +*/ + "</p>";
                                }
                                indexPage += "</body></html>"
                                response.send(indexPage);
                        } else {
                                response.send('<!DOCTYPE HTML><html><head><title>Recent Searches</title></head><body><h1>Whoops, something went terribly wrong!</h1></body></html>');
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
