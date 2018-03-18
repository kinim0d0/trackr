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

            console.log("SAving tracker");
            console.log(tracker);
            console.log(req.session);

            Tracker.findByLocalId({localId: tracker.localId, userId: req.session.userId}, function(err, trackers) {

                if (trackers.length == 0) {

                    console.log("not found, create");

                    var newTracker = new Tracker(tracker);
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

                    console.log("updating");

                }

            })        

        }



    })

module.exports = router;