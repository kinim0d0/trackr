var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: true }));
var Tracker = require('../schemas/Tracker');

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

                        res.send({
                            success: true
                        });

                    })

                } else {

                    var oldTracker = trackers[0];
                    oldTracker.name = tracker.name;
                    oldTracker.color = tracker.color;
                    oldTracker.deleted = tracker.deleted;

                    oldTracker.save(function(err) {

                        if (err) console.log(err);

                        res.send({
                            success: true
                        });

                    })

                }

            })

        }



    })

module.exports = router;
