var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: true }));
var Tracker = require('../schemas/Tracker');

router.route('/getDay')

    .post(function(req, res) {

        var day = req.body.day;

        Tracker.getAllFromUser(req.session.userId, function(err, trackers) {

            for (var i = 0; i < trackers.length; i++) {

                var tracker = trackers[i];
                var trackerDays = tracker.days;
                for (trackerDay in trackerDays) {
                    if (trackerDay != day) {
                        delete trackerDays[trackerDay]
                    }
                }

            }

            res.send({
                data: trackers,
                view: 'day',
                day: req.body.day
            })

        })

    })

module.exports = router;
