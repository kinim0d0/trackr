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

app.use(function(req, res, next) {

  next();

})

app.use(session({
  secret: 'trackr',
  resave: false,
  saveUninitialized: true
}))

var DB_LINK = "mongodb://localhost/trackr";
//var DB_LINK = "mongodb://dominik:OhhGodAPasswordAgain@ds115799.mlab.com:15799/trackr";

mongoose.connect(DB_LINK, {
  config: { autoIndex: true } 
})

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("CONNECTED TO DB");
})

app.get("/dashboard*", function(req, res) {

  if (req.session.userId == undefined) {
    req.session.userId = "5aae59242c44323f9c8763b1";
    console.log("RELOG");
  }

  if (req.session.userId == undefined) {

    res.redirect("/");

  } else {

    res.render('dashboard', {
      section: 'dashboard',
      session: req.session
    })

  }

})

app.get("/", function(req, res) {
  res.render('index', {
    section: 'home',
    session: req.session
  })
})

var UserController = require('./controller/User');
app.use('/user', UserController);

var TrackerController = require('./controller/Tracker');
app.use('/tracker', TrackerController);

app.listen(port, function(err) {
	if (err) console.log(err);
	console.log("Server running on " + port);
})

/*var http = require('http').Server(app);
var io = require('socket.io')(http);

http.listen(3002, function(){
  console.log('Socket IO running on ' + 3002);
});*/