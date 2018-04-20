var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: true }));
var Tracker = require('../schemas/Tracker');
var Log = require('../schemas/Log');

daysFromEpoch = function() {
	var current_date = new Date();
	var epocDate = new Date(new Date().getTime() / 1000);
	var res = Math.abs(current_date - epocDate) / 1000;
	var days = Math.floor(res / 86400);
	return days
}

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

router.route('/addNewTimer')

    .post(function(req, res) {

        var trackerId = req.body.trackerId;
        var day = daysFromEpoch();
        var timerId = req.body.localId

        console.log(trackerId, day, '----')

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

                })

                res.send({
                    success: true,
                    data: 'timer stopped'
                });

            })

        })


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

            //if (req.session.userId == undefined) { req.session.userId = "5aae59242c44323f9c8763b1"; }

            Tracker.findByLocalId({localId: tracker.localId, userId: req.session.userId}, function(err, trackers) {

                if (trackers.length == 0) {

                    console.log("not found, create");

                    var newTracker = new Tracker(tracker);

                    newTracker.userId = req.session.userId;
                    newTracker.days = {
                        0: null
                    };

                    newTracker.save(function(err) {

                        if (err) console.log(err);

                        var log = new Log({
                            localId: newTracker.localId,
                            userId: req.session.userId,
                            contentId: newTracker._id
                        })

                        log.save(req, function(err, log) {

            				if (err) console.log(err);

            				res.send({
            					success: true
            				});

            			})

                    })

                } else {

                    var oldTracker = trackers[0];
                    oldTracker.name = tracker.name;
                    oldTracker.color = tracker.color;
                    oldTracker.deleted = tracker.deleted;

                    oldTracker.save(function(err) {

                        if (err) console.log(err);

                        var log = new Log({
                            localId: oldTracker.localId,
                            userId: req.session.userId,
                            contentId: oldTracker._id
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

        }



    })

    router.route('/editTimer')

        .post(function(req, res) {

            var timer = req.body;
            var error;

            console.log(timer)

            //if (req.session.userId == undefined) { req.session.userId = "5aae59242c44323f9c8763b1"; }

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

                    tracker.save(function(err, tracker) {

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

module.exports = router;
