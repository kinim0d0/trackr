var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: true }));
var Tracker = require('../schemas/Tracker');

router.route('/')

    .post(function(req, res) {

        var log = [];

        Tracker.getAllFromUser(req.session.userId, function(err, trackers) {

            for (tracker in trackers) {
                log.push(trackers[tracker]);
            }

            res.send({
                success: true,
                log: log,
                lastSync: Date.now(),
            });

        })

    })

module.exports = router;
