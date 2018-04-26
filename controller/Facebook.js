var Tracker = require('../schemas/Tracker');

/**
 *  Generates a substitute localId for requests from facebook
 *
 *  @returns {String}
 */
function generateLocalId() {
	return new Date().getTime().toString();
}

/**
 *  Sends a message to a Facebook user
 *
 *  @param {Number} sender  facebook id of the recipient
 *  @param {String} text  message to sent
 */
function sendMessageFb(sender, text) {

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

/**
 *  Sends a message with all the todos for today to a Facebook user
 *
 *  @param {Object} req  request object to trigger socket.io
 *  @param {Number} user  Facebook id
 */
function getTodos(req, user) {

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

/**
 *  Adds a note with the current timestamp to the currently runnig tracker
 *
 *  @param {Object} req  request object to trigger socket.io
 *  @param {Number} user  Facebook id
 *  @param {String} note  Note to send
 */
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

            if (!found) {
                //sendMessageFb(user.facebookId, "You have to start a tracker before you can add a note to it");
            }

        }

    })

}

/**
 *  Crosses off all todos for today with a matching name
 *
 *  @param {Object} req  request object to trigger socket.io
 *  @param {Number} user  Facebook id
 *  @param {String} todo  todo to complete
 */
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

/**
 *  Adds a todo for today
 *
 *  @param {Object} req  request object to trigger socket.io
 *  @param {Number} user  Facebook id
 *  @param {String} text  text containig the task name to add the todo to
 */
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

/**
 *  Adds a task for today
 *
 *  @param {Object} req  request object to trigger socket.io
 *  @param {Number} user  Facebook id
 *  @param {String} text  text contaning the tracker name, task name and the duration of the task
 */
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

/**
 *  Adds a new tracker
 *
 *  @param {Object} req  request object to trigger socket.io
 *  @param {Number} user  Facebook id
 *  @param {String} text  name of the tracker
 */
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

/**
 *  Sends all the trackers to a user
 *
 *  @param {Object} req  request object to trigger socket.io
 *  @param {Number} user  Facebook id
 */
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

/**
 *  Stops all trackers
 *
 *  @param {Object} req  request object to trigger socket.io
 *  @param {Number} user  Facebook id
 */
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

/**
 *  Starts a tracker
 *
 *  @param {Object} req  request object to trigger socket.io
 *  @param {Number} user  Facebook id
 *  @param {String} user  Tracker Name
 */
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

}

module.exports = {

    /**
     *  Handles all incoming requests from Facebook
     *
     *  @param {Object} req  request object to trigger socket.io
     *  @param {Number} res  result
     */
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
                                    text = text.substr(0, 1).toLowerCase() + text.substr(1, text.length-1);

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
