var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var trackerSchema = Schema({

	localId: {type: String, required: true},
	userId: {type: Schema.Types.ObjectId, required: true},
	name: {type: String, required: true},
	days: {type: Schema.Types.Mixed, required: true},
	color: {type: String, required: true},
	deleted: {type: Boolean, required: true},
	tasks: {type: Schema.Types.Mixed, required: false},
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
	timestamps: true,
	usePushEach: true,

});

// Returns a tracker by its local id
trackerSchema.statics.findByLocalId = function(data, cb) {

    var Tracker = require('../schemas/Tracker.js')

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

// Returns the number of days elapsed since the epoch
trackerSchema.statics.daysFromEpoch = function(dateTo) {
	dateTo = Date.parse(dateTo)
	var epocDate = new Date(new Date().getTime() / 1000);
	var res = Math.abs(dateTo - epocDate) / 1000;
	var days = Math.floor(res / 86400);
	return days
}

// Returns all the trackers for a user
trackerSchema.statics.getAllFromUser = function(userId, cb) {

    var Tracker = require('../schemas/Tracker.js')

    Tracker
        .find({'userId': userId})
        .exec(function(err, tracker) {

            if (cb !== null) {
                cb(null, tracker);
                return;
            } else {
                return tracker;
            }

        })

}

trackerSchema.pre('save', function(next, req, callback) {

    console.log("SENDING IO: ");
    var io = req.app.locals.io;
    var connectedUser = req.app.locals.connections[this.userId];

    if (connectedUser != undefined) {
        console.log("SENDING PACKET TO ");
        console.log(connectedUser);
        for(var i = 0; i < connectedUser.length; i++) {
            var connectedUserInstance = connectedUser[i];
            if (io.sockets.connected[connectedUserInstance] == undefined) continue;
            io.sockets.connected[connectedUserInstance].emit('update', {
                update : true
            });
        }
    }

    next();

});

var trackerModel = mongoose.model("Tracker", trackerSchema);

module.exports = trackerModel;
