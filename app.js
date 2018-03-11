var express = require("express");
var app = express();
var nodemon = require("gulp-nodemon");
var mongoose = require("mongoose");
var bodyParser = require('body-parser');
var path = require ('path');

process.env.ENV = "DEV";

app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb', extended: true}));

var port = process.env.PORT || 3000;

app.use(express.static("assets/public"));
app.use(express.static("views"));
app.set("view engine", "ejs");

// Connect to DB

/*var dbLink = Settings.DB_LINK;

mongoose.connect(dbLink, {
  config: { autoIndex: true } 
})

define("DB_LINK", "mongodb://localhost/diary");
define("DB_LINK_PROD", "mongodb://kinim0d:Nincsen00@ds245687.mlab.com:45687/doentry");

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("CONNECTED TO DB");
})*/

/*var api = require("./routes/api");
app.use('/api', api);*/

app.get("/dashboard*", function(req, res) {
	res.render('dashboard', {
    section: 'dashboard'
  })
})

app.get("*", function(req, res) {
  res.render('index', {
    section: 'home'
  })
})

app.listen(port, function(err) {
	if (err) console.log(err);
	console.log("Server running on " + port);
})

/*var http = require('http').Server(app);
var io = require('socket.io')(http);

http.listen(3002, function(){
  console.log('Socket IO running on ' + 3002);
});*/