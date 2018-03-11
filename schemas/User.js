var mongoose = require("mongoose");
var Schema = mongoose.Schema;

bcrypt = require('bcrypt'),
SALT_WORK_FACTOR = 12;

var userSchema = Schema({

	password: {type: String, required: true},
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
			next();
		});

	} else {

		next();

	}

});

userSchema.methods.comparePassword = function(candidatePassword, cb) {

    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) console.error(err);
        if (cb == undefined) return isMatch;
        cb(null, isMatch);
    });

    return;

};

userSchema.statics.isUserExists = function(email, cb) {

	this.find({ email: email }, cb);

};

var userModel = mongoose.model("User", userSchema);

module.exports = userModel;