var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: true }));
var Tracker = require('../schemas/Tracker');
var Log = require('../schemas/Log');

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

            if (req.session.userId == undefined) { req.session.userId = "5aae59242c44323f9c8763b1"; }

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

            if (req.session.userId == undefined) { req.session.userId = "5aae59242c44323f9c8763b1"; }

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
