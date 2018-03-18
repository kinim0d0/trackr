var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var trackerSchema = Schema({

	localId: {type: String, required: true},
	name: {type: String, required: true},
	days: {type: Schema.Types.Mixed, required: true},
	color: {type: String, required: true},
	deleted: {type: Boolean, required: true}
	/*
		daysSinceEpoch: {
			description,
			started,
			ended, null by default
			taks: [
				{
					timeAssigned,
					timeSpent,
					todos: [
						{
							title,
							completed
						}
					]
				}
			]
		}
	*/

}, {

	collection: 'Tracker',
	timestamps: true

});

trackerSchema.statics.findByLocalId = function(data, cb) {

    var Tracker = require('../schemas/Tracker.js')

    Tracker
        .find({'userId': data.userId, 'localId': data.localId})
        .exec(function(err, tracker) {

            if (err) console.log(err);

            if (cb == undefined) {
                return tracker;
            } else {
                cb(err, tracker);
            }
            return;
        })

}

trackerSchema.statics.getAllFromUser = function(userId, cb) {

    var Tracker = require('../schemas/Tracker.js')

    Tracker
        .find({'userId': userId, 'deleted': false}, "localId")
        .exec(function(err, tracker) {

            if (cb !== null) {
                cb(null, tracker);
                return;
            } else {
                return tracker;
            }

        })

}


var trackerModel = mongoose.model("Tracker", trackerSchema);

module.exports = trackerModel;