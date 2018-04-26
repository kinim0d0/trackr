var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: true }));
var Tracker = require('../schemas/Tracker');

daysFromEpoch = function() {
	var current_date = new Date();
	var epocDate = new Date(new Date().getTime() / 1000);
	var res = Math.abs(current_date - epocDate) / 1000;
	var days = Math.floor(res / 86400);
	return days
}

// Toggles a todo (completed - not completed)
router.route('/toggleTodo')

    .post(function(req, res) {

        var trackerId = req.body.trackerId;
        var taskId = req.body.taskId;
        var todoId = req.body.todoId;
        var day = req.body.day;

        console.log('--', trackerId, taskId, todoId, day);

        Tracker.findByLocalId({userId: req.session.userId, localId: trackerId}, function(err, trackers) {

            if (err) console.log(err);

            var trackerDay = [];

            var tracker = trackers[0];

            if (typeof tracker.days[day] != 'undefined') {
                // Creating a day container
                trackerDay = tracker.days[day];
            }

            for (var i = 0; i < trackerDay.length; i++) {

                if (trackerDay[i].localId == taskId) {

                    console.log('found the');

                    var todos = trackerDay[i].todos;

                    for (var j = 0; j < todos.length; j++) {

                        if (todos[j].localId == todoId) {
                            todos[j].completed = !todos[j].completed;
                            console.log('rewrote');
                        }

                    }

                    trackerDay[i].todos = todos;

                }

            }

            tracker.days[day] = trackerDay;
            tracker.markModified('days');
            //racker.markModified('days.' + day);

            console.log(trackerDay);

            console.log('final: ', tracker);

            tracker.save(req, function(err, data) {

                if (err) console.log('failed to save new timer', err);

            })

            res.send({
                success: true,
                data: 'saved timer'
            });

        })

    })

// Adds a todo
router.route('/addTodo')

    .post(function(req, res) {

        var trackerId = req.body.trackerId;
        var taskId = req.body.taskId;
        var todoId = req.body.todoId;
        var day = req.body.day;
        var todo = req.body.text;

        console.log(trackerId, taskId, todoId, day, todo);

        Tracker.findByLocalId({userId: req.session.userId, localId: trackerId}, function(err, trackers) {

            if (err) console.log(err);

            var trackerDay = [];

            var tracker = trackers[0];

            if (typeof tracker.days[day] != 'undefined') {
                // Creating a day container
                trackerDay = tracker.days[day];
            }

            var todos = [];

            for (var i = 0; i < trackerDay.length; i++) {

                if (trackerDay[i].localId == taskId) {

                    if (trackerDay[i].todos != undefined) {
                        todos = trackerDay[i].todos;
                    }

                    todos.push({
                        text: todo,
                        completed: false,
                        localId: todoId
                    });

                    trackerDay[i].todos = todos;

                }

            }

            tracker.days[day] = trackerDay;
            tracker.markModified('days');
            //racker.markModified('days.' + day);

            console.log(trackerDay);

            console.log('final: ', tracker);

            tracker.save(req, function(err, data) {

                if (err) console.log('failed to save new timer', err);

            })

            res.send({
                success: true,
                data: 'saved timer'
            });

        })

    })

// Removes a task
router.route('/removeTask')

    .post(function(req, res) {

        var trackerId = req.body.trackerId;
        var day = req.body.day;
        var taskId = req.body.taskId;

        console.log(trackerId, day, taskId);

        Tracker.findByLocalId({userId: req.session.userId, localId: trackerId}, function(err, trackers) {

            if (err) console.log(err);

            console.log('trackers: ', trackers);

            var trackerDay = [];

            var tracker = trackers[0];

            if (typeof tracker.days[day] != 'undefined') {
                // Creating a day container
                trackerDay = tracker.days[day];
            }

            for (var i = 0; i < trackerDay.length; i++) {

                if (trackerDay[i].localId == taskId) {

                    trackerDay.splice(i, 1);

                }

            }

            tracker.markModified('days');

            console.log('final: ', tracker);

            tracker.save(req, function(err, data) {

                if (err) console.log('failed to save new timer', err);

            })

            res.send({
                success: true,
                data: 'saved timer'
            });

        })

    })

// Adds a task
router.route('/addTask')

    .post(function(req, res) {

        var trackerId = req.body.task.trackerId;
        var day = req.body.day;

        console.log(trackerId, day, '----');

        Tracker.findByLocalId({userId: req.session.userId, localId: trackerId}, function(err, trackers) {

            if (err) console.log(err);

            console.log('trackers: ', trackers);

            var trackerDay = [];

            var tracker = trackers[0];

            if (typeof tracker.days[day] != 'undefined') {
                // Creating a day container
                trackerDay = tracker.days[day];
            }

            trackerDay.push(req.body.task)

            tracker.days[day] = trackerDay;
            tracker.markModified('days');
            //racker.markModified('days.' + day);

            console.log(trackerDay);

            console.log('final: ', tracker);

            tracker.save(req, function(err, data) {

                if (err) console.log('failed to save new timer', err);

            })

            res.send({
                success: true,
                data: 'saved timer'
            });

        })

    })

// Removes a tracker
router.route('/removeTracker')

    .post(function(req, res) {

        Tracker.findByLocalId({userId: req.session.userId, localId: req.body.trackerId}, function(err, trackers) {

            if (err) console.log(err);

            var tracker = trackers[0];

            tracker.deleted = true;

            tracker.save(req, function(err, data) {

                if (err) console.log('failed to REMOVED tracker', err);

                res.send({
                    success: true,
                    data: 'tracker removed'
                });

            })

        })

    })

// Adds a note
router.route('/addNote')

    .post(function(req, res) {

        //console.log(req.body);

        var trackerId = req.body.timer.trackerId;
        var timerId = req.body.timer.localId;
        var day = req.body.timer.day;

        Tracker.findByLocalId({userId: req.session.userId, localId: trackerId}, function(err, trackers) {

            if (err) console.log(err);

            var trackerDay = [];

            var tracker = trackers[0];

            var trackerDay = tracker.days[day];

            console.log('collection of the timers day: ', trackerDay);

            var timer = undefined;

            var notes = [];

            for (var i = 0; i < trackerDay.length; i++) {

                if (trackerDay[i].localId == timerId) {

                    if (trackerDay[i].notes != undefined) {
                        notes = trackerDay[i].notes;
                    }

                    notes.push({
                        timestamp: Date.now(),
                        description: req.body.note
                    })

                    trackerDay[i].notes = notes;

                }

            }

            tracker.days[day] = trackerDay;
            tracker.markModified('days');

            console.log('final: ', tracker);

            tracker.save(req, function(err, data) {

                if (err) console.log('failed to save new timer', err);

                res.send({
                    success: true,
                    data: 'note added'
                });

            })

        })

    })

// Adds a new timer
router.route('/addNewTimer')

    .post(function(req, res) {

        var trackerId = req.body.trackerId;
        var day = daysFromEpoch();
        var timerId = req.body.localId

        console.log(trackerId, day, '----')

        Tracker.getAllFromUser(req.session.userId, function(err, trackers) {

            console.log('sto[pp]', trackers)

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

        Tracker.findByLocalId({userId: req.session.userId, localId: trackerId}, function(err, trackers) {

            if (err) console.log(err);

            console.log('trackers: ', trackers);

            var trackerDay = [];

            var tracker = trackers[0];

            if (typeof tracker.days[day] != 'undefined') {
                // Creating a day container
                trackerDay = tracker.days[day];
            }

            trackerDay.push({
                start: Math.round(Date.now()),
                end: null,
                localId: timerId,
                day: day,
                trackerId: tracker.localId,
                taskId: req.body.taskId
            })

            tracker.days[day] = trackerDay;
            tracker.markModified('days');
            //racker.markModified('days.' + day);

            console.log(trackerDay);

            console.log('final: ', tracker);

            tracker.save(req, function(err, data) {

                if (err) console.log('failed to save new timer', err);

            })

            res.send({
                success: true,
                data: 'saved timer'
            });

        })

    })

    router.route('/stopTimer')

        .post(function(req, res) {

            var trackerId = req.body.trackerId;
            var day = req.body.timer.day;
            var timerId = req.body.timer.localId;

            console.log(trackerId, req.body.timer, '----')

            Tracker.findByLocalId({userId: req.session.userId, localId: trackerId}, function(err, trackers) {

                if (err) console.log(err);

                var trackerDay = [];

                var tracker = trackers[0];

                console.log('tracker: ', tracker, day);

                if (typeof tracker.days[day] != 'undefined') {
                    // Creating a day container
                    trackerDay = tracker.days[day];
                }

                console.log('collection of the timers day: ', trackerDay);

                var timer = undefined;

                for (var i = 0; i < trackerDay.length; i++) {
                    if (trackerDay[i].localId == timerId) {
                        trackerDay[i].end = Date.now();
                    }
                }

                tracker.days[day] = trackerDay;
                tracker.markModified('days');

                console.log('final: ', tracker);

                tracker.save(req, function(err, data) {

                    if (err) console.log('failed to save new timer', err);

                });

                res.send({
                    success: true,
                    data: 'timer stopped'
                });

            })

        })

// Creates or updates a tracker
router.route('/edit')

    .post(function(req, res) {

        var tracker = req.body;
        var error;

        if ( (tracker.name == undefined || tracker.name.length < 1) ) {

            error = {
                field: ".name",
                msg: "Enter a name"
            }

        }

        if ( (tracker.color == undefined || tracker.color.length < 1) ) {

            error = {
                field: ".color-picker",
                msg: "Select a color"
            }

        }

        if ( (tracker.localId == undefined || tracker.localId.length < 1) ) {

            error = {}

        }

        if (error != undefined) {

            res.send({
                success: false,
                error: error
            });

        } else {

            Tracker.findByLocalId({localId: tracker.localId, userId: req.session.userId}, function(err, trackers) {

                if (trackers.length == 0) {

                    var newTracker = new Tracker(tracker);

                    newTracker.userId = req.session.userId;
                    newTracker.days = {
                        0: null
                    };

                    newTracker.save(req, function(err) {

                        if (err) console.log(err);

        				res.send({
        					success: true
        				});

                    })

                } else {

                    var oldTracker = trackers[0];
                    oldTracker.name = tracker.name;
                    oldTracker.color = tracker.color;
                    oldTracker.deleted = tracker.deleted;

                    oldTracker.save(req, function(err) {

                        if (err) console.log(err);

                        res.send({
                            success: true
                        });

                    })

                }

            })

        }



    })

    // Creates or edits a timer
    router.route('/editTimer')

        .post(function(req, res) {

            var timer = req.body;
            var error;

            Tracker.findByLocalId({localId: timer.trackerId, userId: req.session.userId}, function(err, trackers) {

                if (trackers.length == 0) {

                    console.log("not found tracker");

                } else {

                    var tracker = trackers[0];

                    var day = Tracker.daysFromEpoch(timer.start);

                    var days = tracker['days'];

                    if (days[day] == undefined) {

                        days[day] = {

                        }

                    }

                    days[day][timer.localId] = timer

                    tracker.markModified('days');

                    tracker.save(req, function(err, tracker) {

                        if (err) console.log(err);

                        var log = new Log({
                            localId: timer.localId + "#" + timer.day,
                            userId: req.session.userId,
                            contentId: tracker._id
                        })

                        log.save(req, function(err, log) {

                            if (err) console.log(err);

                            res.send({
                                success: true
                            });

                        })

                    })

                }

            })

        })

function addNewTracker() {

}

module.exports = router;
