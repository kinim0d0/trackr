var express = require("express");
var app = express();
var nodemon = require("gulp-nodemon");
var mongoose = require("mongoose");
var bodyParser = require('body-parser');
var path = require ('path');
var session = require('express-session')

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


var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("CONNECTED TO DB");
})*/

/*var api = require("./routes/api");
app.use('/api', api);*/

app.use(session({
  secret: 'trackr',
  resave: false,
  saveUninitialized: true
}))

var DB_LINK = "mongodb://localhost/trackr";
//define("DB_LINK_PROD", "mongodb://kinim0d:Nincsen00@ds245687.mlab.com:45687/doentry");

mongoose.connect(DB_LINK, {
  config: { autoIndex: true } 
})

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("CONNECTED TO DB");
})

app.get("/dashboard*", function(req, res) {

  //console.log("Session ?");
  //console.log(req.session);

  if (req.session.userId == undefined) {

    res.redirect("/");

  } else {

    res.render('dashboard', {
      section: 'dashboard'
    })

  }

})

app.get("/", function(req, res) {
  res.render('index', {
    section: 'home'
  })
})

var UserController = require('./controller/User');
app.use('/user', UserController);

app.listen(port, function(err) {
	if (err) console.log(err);
	console.log("Server running on " + port);
})

/*var http = require('http').Server(app);
var io = require('socket.io')(http);

http.listen(3002, function(){
  console.log('Socket IO running on ' + 3002);
});*/