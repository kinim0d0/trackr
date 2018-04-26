var mongoose = require("mongoose");
var Schema = mongoose.Schema;

bcrypt = require('bcrypt'),
SALT_WORK_FACTOR = 12;

var userSchema = Schema({

	password: {type: String, required: true},
	facebookId: {type: Number, required: false},
	facebookVerificationID: {type: String},
	email: {
		type: String,
		lowercase: true,
		required: true,
		index: {unique: true},
		match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "#login-email"]
	},

}, {

	collection: 'User',
	timestamps: true

});

userSchema.pre('save', function(next) {

    var user = this;

    if (this.isNew) {

		bcrypt.hash(user.password, SALT_WORK_FACTOR, function(err, hash) {

			if (err) return next(err);
			user.password = hash;
			var facebookVerificationID = "";

			for (var i = 0; i < 10; i++) {
				facebookVerificationID += "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".charAt(Math.floor(Math.random() * 62));
			}

			user.facebookVerificationID = facebookVerificationID;
			next();

		});

	} else {

		next();

	}

});

// Compares the given password to a hashed password
userSchema.methods.comparePassword = function(candidatePassword, cb) {

    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) console.error(err);
        if (cb == undefined) return isMatch;
        cb(null, isMatch);
    });

    return;

};

// Returns whether a user exsists or not
userSchema.statics.isUserExists = function(email, cb) {

	this.find({ email: email }, cb);

};

var userModel = mongoose.model("User", userSchema);

module.exports = userModel;
