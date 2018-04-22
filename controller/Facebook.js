var Tracker = require('../schemas/Tracker');

function generateLocalId() {
	return new Date().getTime().toString();
}

function sendMessageFb(sender, text) {

    //let sender = event.sender.id;
    //let text = event.message.text;
    const request = require('request');
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

function addNote(user, note) {

    Tracker.getAllFromUser(user._id, function(err, trackers) {

        var day = daysFromEpoch();

        for (var i = 0; i < trackers.length; i++) {

            var tracker = trackers[i];
            var todayDays = tracker.days[day];

            if (todayDays == undefined) {
                continue
            }

            var found = false;

            for (var j = 0; j < todayDays.length; j++) {

                if ( (todayDays[j].start != undefined) && (todayDays[j].end == null) ) {

                    found = true;

                    var notes = [];

                    if (todayDays[j].notes != undefined) {
                        notes = todayDays[j].notes;
                    }

                    notes.push({
                        timestamp: Date.now(),
                        description: note
                    })

                    todayDays[j].notes = notes;

                    tracker.markModified('days');
                    tracker.save(function(err, tracker) {
                        sendMessageFb(user.facebookId, "Noted");
                    })

                }

            }

        }

        if (!found) {
            sendMessageFb(user.facebookId, "You have to start a tracker before you can add a note to it");
        }

    })

}

function addTracker(user, trackerName) {

    trackerName = trackerName.trim();

    if (trackerName.length == 0) {

        sendMessageFb(user.facebookId, "Enter a tracker name");

    } else {

        var tracker = {
            name: trackerName,
            color: 'red',
            localId: 'TR' + generateLocalId(),
            deleted: false,
            tasks: [],
            days: {
                0: null
            },
            userId: user._id
        }

        var newTracker = new Tracker(tracker);

        newTracker.save(function(err) {

            if (err) console.log(err);

            sendMessageFb(user.facebookId, trackerName + " created");

        })

    }

}

function getTrackers(user) {

    Tracker.getAllFromUser(user._id, function(err, trackers) {

        if (trackers.length == 0) {

            sendMessageFb(user.facebookId, "You don't have any trackers yet");

        } else {

            var msg = "";

            for (var i = 0; i < trackers.length; i++) {

                msg += (i + 1) + ": " + trackers[i].name + "\u000A";

            }

            sendMessageFb(user.facebookId, msg);

        }

    })

}

function stopTrackers(user) {

    Tracker.getAllFromUser(user._id, function(err, trackers) {

        var day = daysFromEpoch();

        for (var i = 0; i < trackers.length; i++) {

            var tracker = trackers[i];
            var todayDays = tracker.days[day];

            if (todayDays == undefined) {
                continue
            }

            for (var j = 0; j < todayDays.length; j++) {
                if ( (todayDays[j].start != undefined) && (todayDays[j].end == null) ) {
                    todayDays[j].end = Date.now();
                    tracker.markModified('days');
                    tracker.save(function(err, tracker) {
                        console.log('stopped timer')
                    })
                }
            }

        }

        sendMessageFb(user.facebookId, "All trackers stopped");

    })

}

function startTracker(user, trackerName) {

    Tracker.find({'userId': user._id, 'name': trackerName}, function(err, trackers) {

        if (err) console.log(err);

        if (trackers.length == 0) {

            sendMessageFb(user.facebookId, "I couldn't find this tracker");

        } else {

            var tracker = trackers[0];

            var trackerId = tracker.localId;
            var day = daysFromEpoch();
            var timerId = "TI" + generateLocalId()

            console.log(trackerId, day, '----')

            Tracker.getAllFromUser(user._id, function(err, trackers) {

                for (var i = 0; i < trackers.length; i++) {

                    var tracker = trackers[i];
                    var todayDays = tracker.days[day];

                    if (todayDays == undefined) {
                        continue
                    }

                    for (var j = 0; j < todayDays.length; j++) {
                        if ( (todayDays[j].start != undefined) && (todayDays[j].end == null) ) {
                            todayDays[j].end = Date.now();
                            tracker.markModified('days');
                            tracker.save(function(err, tracker) {
                                console.log('stopped timer')
                            })
                        }
                    }

                }

            })

            Tracker.findByLocalId({userId: user._id, localId: trackerId}, function(err, trackers) {

                if (err) console.log(err);

                console.log('trackers: ', trackers);

                var trackerDay = [];

                var tracker = trackers[0];

                if (typeof tracker.days[day] != 'undefined') {
                    // Creating a day container
                    trackerDay = tracker.days[day];
                }

                trackerDay.push({
                    start: Date.now(),
                    end: null,
                    localId: timerId,
                    day: day,
                    trackerId: tracker.localId
                })

                tracker.days[day] = trackerDay;
                tracker.markModified('days');
                //racker.markModified('days.' + day);

                console.log(trackerDay);

                console.log('final: ', tracker);

                tracker.save(function(err, data) {

                    if (err) console.log('failed to save new timer', err);

                })

                sendMessageFb(user.facebookId, trackerName + " started");

            })

        }

    })

    //

}

module.exports = {

    handleFbRequest: function(req, res) {

        if (req.body.object === 'page') {

            if (req.body.entry != undefined) {

                req.body.entry.forEach((entry) => {

                    entry.messaging.forEach((event) => {

                        if (event.message && event.message.text) {

                            console.log('New message from FB', event.sender.id, event.message.text);

                            var User = require('../schemas/User');

                            User.find({'facebookId': event.sender.id}, function(err, users) {

                                var message = event.message.text;

                                if (users.length == 0) {

                                    if (message.length == 8) {

                                        User.find({'facebookVerificationID': message}, function(err, users) {

                                            if (users.length != 0) {

                                                var user = users[0];

                                                user.facebookId = event.sender.id;

                                                user.save(function(err, user) {

                                                    sendMessageFb(event.sender.id, "Successfully authenticated");
                                                    sendMessageFb(event.sender.id, "Type 'info' to see all the options");

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

                                    var text = message;

                                    console.log('handling users request', user, text);

                                    var msg = "I didn't quite get that, you can type info to check all available commands"

                                    if (text == "info") {
                                        msg = '\
Here are all the things I can do: \u000A\
Start a timer - start {Tracker Name}\u000A\
Stop the currently running timer - stop\u000A\
Add a note with the current timestamp to the running tracker - note {note}\u000A\
Get a list of all your trackers - trackers\u000A\
Get all todos for today - todos\u000A\
Create a new time tracker - create {Tracker Name}\u000A\
Create a new task for today - add {Task Name}\u000A\
Add a todo to a task - add {todo} to {task}\u000A\
                                        ';
                                        sendMessageFb(user.facebookId, msg);
                                    } else if (text.substr(0, 5) == "start") {

                                        var trackerName = text.substr(6, text.length-1);
                                        startTracker(user, trackerName)

                                    } else if (text == "stop") {

                                        stopTrackers(user);

                                    } else if (text.substr(0, 4) == "note") {

                                        var note = text.substr(5, text.length-1);
                                        addNote(user, note);

                                    } else if (text == "trackers") {

                                        getTrackers(user);

                                    } else if (text.substr(0, 6) == "create") {

                                        addTracker(user, text.substr(6, text.length-1));

                                    }

                                }

                            })

                        }

                    });

                });

            }

        }


    }

}
