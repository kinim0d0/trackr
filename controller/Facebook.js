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

function getTodos(req, user, note) {

    var msg = "Here are your todos for today \u000A\u000A"

    Tracker.getAllFromUser(user._id, function(err, trackers) {

        if (trackers.length == 0) {

            sendMessageFb(user.facebookId, "You don't have any trackers yet");

        } else {

            for (var i = 0; i < trackers.length; i++) {

                var tracker = trackers[i];
                var day = daysFromEpoch();
                var todayDays = tracker.days[day];

                if (todayDays == undefined) {
                    continue
                }

                for (var j = 0; j < todayDays.length; j++) {

                    if (todayDays[j].todos != undefined) {

                        msg += "*" + todayDays[j].name + "* (" + todayDays[j].todos.length + ")\u000A"

                        for (var k = 0; k < todayDays[j].todos.length; k++) {

                            if (todayDays[j].todos[k].completed) {
                                msg += "~" + todayDays[j].todos[k].text + "~\u000A";
                            } else {
                                msg += todayDays[j].todos[k].text + "\u000A";
                            }

                        }

                        msg += "\u000A";

                    }

                }

            }

        }

        sendMessageFb(user.facebookId, msg);

    })

}

function addNote(req, user, note) {

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
                    tracker.save(req, function(err, tracker) {
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

function completeTodo(req, user, todo) {

    var todo = todo.trim();

    if (todo.length == 0) {

        sendMessageFb(user.facebookId, "Please enter a todo to cross off");

    } else {

        Tracker.getAllFromUser(user._id, function(err, trackers) {

            if (trackers.length == 0) {

                sendMessageFb(user.facebookId, "You have no trackers");

            } else {

                var day = daysFromEpoch();

                for (var i = 0; i < trackers.length; i++) {

                    var tracker = trackers[i];

                    var todayDays = tracker.days[day];

                    if (todayDays == undefined) {
                        continue;
                    }

                    var found = false;

                    for (var j = 0; j < todayDays.length; j++) {

                        if (todayDays[j].todos != undefined) {

                            for (var k = 0; k < todayDays[j].todos.length; k++) {

                                if (todayDays[j].todos[k].text == todo) {

                                    found = true;
                                    todayDays[j].todos[k].completed = true;

                                    tracker.markModified('days');

                                    tracker.save(req, function(err, tracker) {

                                        sendMessageFb(user.facebookId, "Crossed it off the list");

                                    })

                                }

                            }

                        }

                    }

                }

            }

        })

    }

}

function addTodo(req, user, text) {

    var text = text.trim();

    if (text.indexOf(' to ') == -1) {

        sendMessageFb(user.facebookId, "Please use this form to add a new todo: add todo {todo} to {task}");

    } else {

        text = text.substr(8, text.length-1);
        text = text.trim();
        text = text.split(" ");

        console.log('adding to do', text)

        var taskName = "";
        var todoName = "";
        var i = 0;

        while (text[i] != "to") {
            todoName += text[i] + " "
            i++
        }

        todoName = todoName.trim();
        i++;

        while (i < text.length) {
            taskName += text[i] + " ";
            i++;
        }

        taskName = taskName.trim();

        console.log('adding todo', taskName, todoName);

        Tracker.getAllFromUser(user._id, function(err, trackers) {

            if (trackers.length == 0) {

                sendMessageFb(user.facebookId, "You have no trackers");

            } else {

                for (var i = 0; i < trackers.length; i++) {

                    var tracker = trackers[i];

                    var day = daysFromEpoch();
                    var todayDays = tracker.days[day];

                    if (todayDays == undefined) {
                        todayDays = [];
                    }

                    var found = false;

                    for (var j = 0; j < todayDays.length; j++) {

                        var todos = [];

                        if (todayDays[j].name == taskName) {

                            found = true;

                            if (todayDays[j].todos != undefined) {
                                todos = todayDays[j].todos;
                            }

                            todos.push({
                                completed: false,
                                text: todoName
                            })

                            todayDays[j].todos = todos;

                            tracker.markModified('days');

                            tracker.save(req, function(err, tracker) {

                                sendMessageFb(user.facebookId, "Added todo");

                            })

                        }

                    }

                }

                if (!found) {

                    sendMessageFb(user.facebookId, "I couldn't find " + taskName);

                }

            }

        })

    }


}

function addTask(req, user, text) {

    var text = text.trim();

    if ( (text.indexOf(' to ') == -1) || (text.indexOf(' with ') == -1) ) {

        sendMessageFb(user.facebookId, "Please use this form to add a new task: add task {task} to {tracker} with {mins}");

    } else {

        text = text.split(" ");

        var trackerName = "";
        var taskName = "";
        var duration = null;
        var i = 2;

        while (text[i] != "to") {
            taskName += text[i] + " "
            i++
        }

        taskName = taskName.trim();
        i++;

        while (text[i] != "with") {
            trackerName += text[i] + " "
            i++
        }

        //taskName = taskName.replace("with", "");
        trackerName = trackerName.trim();

        duration = text[++i];

        Tracker.find({'userId': user._id, 'name': trackerName}, function(err, trackers) {

            if (trackers.length == 0) {

                sendMessageFb(user.facebookId, "You don't have a tracker named " + trackerName);

            } else {

                var tracker = trackers[0];

                var day = daysFromEpoch();
                var todayDays = tracker.days[day];

                if (todayDays == undefined) {
                    todayDays = [];
                }

                duration = parseInt(duration);

                if (isNaN(duration)) {
                    sendMessageFb(user.facebookId, "Enter a valid duration");
                    return;
                }

                for (var i = 0; i < todayDays.length; i++) {

                    if (todayDays[i].name == taskName) {
                        sendMessageFb(user.facebookId, "You already have a task named " + taskName);
                        return;
                    }

                }

                todayDays.push({
                    name: taskName,
                    localId: "TA" + generateLocalId(),
                    trackerId: tracker.localId,
                    deleted: false,
                    duration: duration
                })

                tracker.days[day] = todayDays;

                tracker.markModified('days');

                tracker.save(req, function(err, data) {

                    if (err) console.log('failed to save new timer', err);

                    sendMessageFb(user.facebookId, "Task added");

                })

            }

        })

    }

}

function addTracker(req, user, trackerName) {

    trackerName = trackerName.trim();

    if (trackerName.length == 0) {

        sendMessageFb(user.facebookId, "Enter a tracker name");

    } else {

        Tracker.getAllFromUser(user._id, function(err, trackers) {

            if (trackers.length != 0) {

                for (var i = 0; i < trackers.length; i++) {

                    if (trackers[i].name == trackerName) {
                        sendMessageFb(user.facebookId, "You already have a tracker named " + trackerName);
                        return
                    }

                }

            }

        })

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

        newTracker.save(req, function(err) {

            if (err) console.log(err);

            sendMessageFb(user.facebookId, trackerName + " created");

        })

    }

}

function getTrackers(req, user) {

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

function stopTrackers(req, user) {

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
                    tracker.save(req, function(err, tracker) {
                        console.log('stopped timer')
                    })
                }
            }

        }

        sendMessageFb(user.facebookId, "All trackers stopped");

    })

}

function startTracker(req, user, trackerName) {

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
                    tracker.save(req, function(err, tracker) {
                        console.log('stopped timer')
                    })
                }
            }

        }

        var day = daysFromEpoch();
        var found = false;

        for (var i = 0; i < trackers.length; i++) {

            var tracker = trackers[i];
            var todayDays = tracker.days[day];

            if (todayDays == undefined) {
                continue
            }

            for (var j = 0; j < todayDays.length; j++) {

                if (todayDays[j].name == trackerName) {

                    //console.log('found by taskname');

                    todayDays.push({
                        start: Date.now(),
                        end: null,
                        localId: "TI" + generateLocalId(),
                        day: day,
                        trackerId: tracker.localId,
                        taskId: todayDays[j].localId
                    })

                    tracker.markModified('days');

                    tracker.save(req, function(err, data) {

                        if (err) console.log('failed to save new timer', err);

                        sendMessageFb(user.facebookId, "Started task");

                    })

                    found = true;
                    return

                }

            }

        }

        // No task match today;
        if (!found) {

            for (var i = 0; i < trackers.length; i++) {

                var tracker = trackers[i];

                if (tracker.name == trackerName) {

                    console.log('found by trackername');
                    found = true;

                    var trackerDay = [];

                    if (typeof tracker.days[day] != 'undefined') {
                        // Creating a day container
                        trackerDay = tracker.days[day];
                    }

                    trackerDay.push({
                        start: Date.now(),
                        end: null,
                        localId: "TI" + generateLocalId(),
                        day: day,
                        trackerId: tracker.localId
                    })

                    tracker.days[day] = trackerDay;
                    tracker.markModified('days');

                    tracker.save(req, function(err, data) {

                        if (err) console.log('failed to save new timer', err);

                        sendMessageFb(user.facebookId, "Started tracker");

                    })


                }

            }

        }

    })

    /*Tracker.find({'userId': user._id, 'name': trackerName}, function(err, trackers) {

        if (err) console.log(err);

        if (trackers.length == 0) {

            sendMessageFb(user.facebookId, "I couldn't find this tracker");

        } else {

            var tracker = trackers[0];

            var trackerId = tracker.localId;

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
                            tracker.save(req, function(err, tracker) {
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

                tracker.save(req, function(err, data) {

                    if (err) console.log('failed to save new timer', err);

                })

                sendMessageFb(user.facebookId, trackerName + " started");

            })

        }

    })*/

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

                                                user.save(req, function(err, user) {

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
Here are all the things I can do: \u000A\u000A\
start {name}              Start a timer\u000A\
stop                          Stop the currently running timer\u000A\
trackers                     List all your trackers\u000A\
note {note}                Add a note to the running tracker\u000A\
trackers                    Get a list of all your trackers\u000A\
todos                        Get all todos for today\u000A\
create {name}           Create a new time tracker\u000A\
done {name}           Marks the todo completed\u000A\
add task {task} to {tracker} with {mins}      Create a new task for today\u000A\
add todo {todo} to {task}  Add a todo to a task\u000A\
                                        ';
                                        sendMessageFb(user.facebookId, msg);
                                    } else if (text.substr(0, 5) == "start") {

                                        var trackerName = text.substr(6, text.length-1);
                                        startTracker(req, user, trackerName)

                                    } else if (text == "stop") {

                                        stopTrackers(req, user);

                                    } else if (text.substr(0, 4) == "note") {

                                        var note = text.substr(5, text.length-1);
                                        addNote(req, user, note);

                                    } else if (text == "trackers") {

                                        getTrackers(req, user);

                                    } else if (text.substr(0, 6) == "create") {

                                        addTracker(req, user, text.substr(6, text.length-1));

                                    } else if (text.substr(0, 8) == "add task") {

                                        addTask(req, user, text);

                                    } else if (text == "todos") {

                                        getTodos(req, user);

                                    } else if (text.substr(0, 8) == "add todo") {

                                        addTodo(req, user, text);

                                    } else if (text.substr(0, 4) == "done") {

                                        completeTodo(req, user, text.substr(4, text.length-1));

                                    } else {

                                        sendMessageFb(user.facebookId, "I didn't catch that, type info to see all the things I can do");

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
