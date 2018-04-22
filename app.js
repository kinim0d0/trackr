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
app.use(express.static("bower_components"));
app.set("view engine", "ejs");

app.use(function(req, res, next) {

  next();

})

app.use(session({
  secret: 'trackr',
  resave: false,
  saveUninitialized: true
}))

//var DB_LINK = "mongodb://localhost/trackr";
var DB_LINK = "mongodb://dominik:OhhGodAPasswordAgain@ds115799.mlab.com:15799/trackr";

mongoose.connect(DB_LINK, {
  config: { autoIndex: true }
})

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("CONNECTED TO DB");
})

app.get("/dashboard*", function(req, res) {

 if (req.session.userId == undefined) { req.session.userId = "5adc4367b42609538f7dde39" }

  if (req.session.userId == undefined) {

    res.redirect("/");

  } else {

    res.render('dashboard', {
      section: 'dashboard',
      session: req.session
    })

  }

})

/* For Facebook Validation */
app.get('/webhook', (req, res) => {
  if (req.query['hub.mode'] && req.query['hub.verify_token'] === 'TimeTrackerRGU3095@uk') {
    res.status(200).send(req.query['hub.challenge']);
  } else {
    res.status(403).end();
  }
});

app.get('/policy', (req, res) => {
    res.status(200).send(req.query['This is just a uni project, pls accept it fb']);
})

var UserController = require('./controller/User');
app.use('/user', UserController);

app.post('/webhook', (req, res) => {

    var FacebookController = require('./controller/Facebook');
    FacebookController.handleFbRequest(req, res);
    res.status(200).end();

});

app.get("/", function(req, res) {

    if (req.session.userId != undefined) {

      res.redirect("/dashboard");

    } else {

        res.render('index', {
          section: 'home',
          session: req.session
        })

    }

})

var UserController = require('./controller/User');
app.use('/user', UserController);

var TrackerController = require('./controller/Tracker');
app.use('/tracker', TrackerController);

var SyncController = require('./controller/Sync');
app.use('/sync', SyncController);

app.listen(port, function(err) {
	if (err) console.log(err);
	console.log("Server running on " + port);
})

var http = require('http').Server(app);
var io = require('socket.io')(http);

http.listen(3002, function(){
  console.log('Socket IO running on ' + 3002);
});

app.locals.io = io;
app.locals.connections = {

}

io.on('connection', function(socket){

  socket.on('startRealTimeSync', function(user){

    var userConnections = app.locals.connections[user.userId];

    if (userConnections == undefined) {
      userConnections = [socket.id]
    } else {
      userConnections.push(socket.id);
    }

    console.log( user.userId + "Socket IO open on: " + socket.id);

    app.locals.connections[user.userId] = userConnections;

    io.sockets.connected[socket.id].emit('realTimeSyncStarted', {
    	socketId: socket.id
    });

  });

  socket.on('disconnect', function() {

    console.log("Socket IO closed on: " + socket.id)
    var connections = app.locals.connections;

    for(var key in connections) {
      var user = connections[key];
      for (var i = 0; i < user.length; i++) {
        if (user[i] == socket.id) {
          user.splice(i, 1);
        }
      }
      connections.key = user;
    }

    app.locals.connections = connections

  });

});
