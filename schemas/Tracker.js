var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var trackerSchema = Schema({

	localId: {type: String, required: true},
	userId: {type: Schema.Types.ObjectId, required: true},
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

	console.log(data.userId);
	console.log(data.localId);

    Tracker
        .find({'userId': mongoose.Types.ObjectId(data.userId), 'localId': data.localId})
        .exec(function(err, tracker) {

			console.log(tracker)

            if (err) console.log(err);

            if (cb == undefined) {
                return tracker;
            } else {
                cb(err, tracker);
            }
            return;
        })

}

trackerSchema.statics.daysFromEpoch = function(dateTo) {
	dateTo = Date.parse(dateTo)
	var epocDate = new Date(new Date().getTime() / 1000);
	var res = Math.abs(dateTo - epocDate) / 1000;
	var days = Math.floor(res / 86400);
	return days
}

trackerSchema.statics.getAllFromUser = function(userId, cb) {

    var Tracker = require('../schemas/Tracker.js')

    Tracker
        .find({'userId': userId, 'deleted': false})
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
