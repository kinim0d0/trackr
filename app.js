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

  //if (req.session.userId == undefined) { req.session.userId = "5aae59242c44323f9c8763b1"; }

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

/* Handling all messenges*/

app.post('/webhook', (req, res) => {

    //console.log(req.body);
    if (req.body.object === 'page') {

        if (req.body.entry != undefined) {

            req.body.entry.forEach((entry) => {

                entry.messaging.forEach((event) => {

                    if (event.message && event.message.text) {

                        console.log('New message from FB', event.sender.id, event.message.text);

                        var User = require('./schemas/User');

                        User.find({'facebookId': event.sender.id}, function(err, users) {

                            if (users.length == 0) {

                                var message = event.message.text;

                                if (message.length == 8) {

                                    User.find({'facebookVerificationID': message}, function(err, users) {

                                        if (users.length != 0) {

                                            var user = users[0];

                                            user.facebookId = event.sender.id;

                                            user.save(function(err, user) {

                                                sendMessageFb(event.sender.id, "Successfully authenticated");

                                            })

                                        } else {

                                            sendMessageFb(event.sender.id, "Invalid authentication key");

                                        }

                                    })

                                } else {

                                    sendMessageFb(event.sender.id, "Hi, please enter your autihentication key to get started");

                                }

                            } else {
                                var user = users[0];
                                handleFbRequest(user, event.message.text);
                            }

                        })

                    }

                });

            });

        }

    }

    res.status(200).end();

});

const request = require('request');

function handleFbRequest(user, text) {
    console.log('handling users request', user, text);
    sendMessageFb(user.facebookId, 'already authenticated');
}

function sendMessageFb(sender, text) {
  //let sender = event.sender.id;
  //let text = event.message.text;

  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {access_token: 'EAAXUxAI0p9wBALjCxKrqtK6sZBFwIfHTVg866qoGiapVDiOZCB6ZAYbY8jhk6dfe3U5wrIKZBOv9Rxow33JCPRZAYZBdgMscQZCQWTyFgRMhOKsWc5H8FXeZBABDH6mioR4xBLlYpP9cAZCksVqFQzOMyHbsjhBZBuwHfPVVQehB0v168PNhYgKAD6'},
    method: 'POST',
    json: {
      recipient: {id: sender},
      message: {text: text}
    }
  }, function (error, response) {
    if (error) {
        console.log('Error sending message: ', error);
    } else if (response.body.error) {
        console.log('Error: ', response.body.error);
    }
  });
}

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
