var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: true }));
var Tracker = require('../schemas/Tracker');
var Log = require('../schemas/Log');

router.route('/')

    .post(function(req, res) {

        Log.getUpdatesSince({ lastSync: req.body.lastSync, userId: req.session.userId }, function(err, log) {

            if (err) console.error(err);

            res.send({
                lastSync: Date.now(),
                log: log
            })

        })

    })

module.exports = router;
