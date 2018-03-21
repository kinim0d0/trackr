var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var logSchema = Schema({

	contentId: { type: Schema.Types.ObjectId, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    localId: { type: String, required: true },

}, {

	collection: 'log',
	timestamps: true,
	usePushEach: true

});

logSchema.pre('save', function(next, req, callback) {

    console.log("Saving Log: ");
    var io = req.app.locals.io;
    var connectedUser = req.app.locals.connections[this.userId];

    if (connectedUser != undefined) {
        console.log("SENDING PACKET TO ");
        console.log(connectedUser);
        for(var i = 0; i < connectedUser.length; i++) {
            var connectedUserInstance = connectedUser[i];
            if (io.sockets.connected[connectedUserInstance] == undefined) continue;
            io.sockets.connected[connectedUserInstance].emit('update', {
                upodate : true
            });
        }
    }

    var Log = require('../schemas/Log.js');
    var logEntry = this;

    Log.find({
        'localId': this.localId,
    }, function(err, data) {
        if (err) console.log(err);
        if (data.length == 0) {
            //next();
        } else {
            Log.update(data[0],{multi: true}, function(err) {
                if (err) console.log(err);
                //next();
            });

        }
    })

    next();

});

logSchema.post('save', function(next, req, callback) {

});

logSchema.statics.getUpdatesSince = function(data, cb) {

    mongoose.Promise = require('bluebird');

	var Tracker = require('../schemas/Tracker.js')

    if (data.lastSync == 0) {

        var allData = [];

		Tracker.getAllFromUser(data.userId, function(err, trackers) {

            for (tracker in trackers) {
				allData.push('TR');
                allData.push(trackers[tracker]);
            }

			cb(null, allData)

            return allData

        })

    } else {

		var Log = require('../schemas/Log.js')

        Log
            .find({'userId': data.userId})
            .where('createdAt')
            .gt(data.lastSync)

        .then(function(results) {

            var content = [];

            for (result of results) {

                var type = result.localId.substr(0,2);

				content.push(result.localId);

                switch (type) {

                    case "TR":
						content.push(Tracker.findById(result.contentId));
                        break;

					case "TI":
						content.push(Tracker.findById(result.contentId));
                        break;

                    default:
                        console.log('unknown content')
                        break;

                }

            }

            return Promise.all(content);

        }).then(function(results) {

			for (var i = 0; i < results.length; i += 2) {
				if (results[i].substr(0, 2) == "TI") {
					var tracker = results[i+1];
					var localId = results[i].split("#");
					var timerLocalId = localId[0];
					var timerDay = localId[1];
					var timer = tracker.days[timerDay][timerLocalId];
					results[i+1] = timer;
				}
			}

            cb(null, results);
            return;

        }).catch(function(error) {

            console.error(error);

        });

    }

}

var logModel = mongoose.model("Log", logSchema);

module.exports = logModel;
