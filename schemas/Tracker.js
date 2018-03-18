var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var trackerSchema = Schema({

	localId: {type: String, required: true},
	name: {type: String},
	days: {type: Schema.Type.Mixed},
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

    var Card = require('../schemas/Card.js')

    Card
        .find({'userId': data.userId, 'localId': data.localId})
        .exec(function(err, file) {
            if (err) console.error(err);
            //console.log(journal);
            if (cb == undefined) {
                console.log(file);
                return file;
            } else {
                cb(err, file);
            }
            return;
        })

}

trackerSchema.statics.findByLocalIds = function(data, cb) {

    var Card = require('../schemas/Card.js')

    Card
        .find({'userId': data.userId, 'localId': { $in: data.localIds }})
        .exec(function(err, cards) {
            if (err) console.error(err);
            if (cb == undefined) {
                return cards;
            } else {
                cb(err, cards);
            }
            return;
        })


}

trackerSchema.statics.getAllFromUser = function(userId, cb) {

    var Card = require('../schemas/Card.js')

    Card
        .find({'userId': userId, 'deleted': false}, "localId")
        .exec(function(err, cards) {
            if (cb !== null) {
                cb(null, cards);
                return;
            } else {
                return cards;
            }
        })

}


var trackerModel = mongoose.model("Tracker", trackerSchema);

module.exports = trackerModel;