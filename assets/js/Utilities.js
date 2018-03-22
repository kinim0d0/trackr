function Utilities() {

}

/**
 *  Returns the current timestamp to be used as the localId
 *
 *  returns {String}
 */
Utilities.prototype.generateLocalId = function() {
	return new Date().getTime().toString();
}

/**
 *  Returns the current timestamp
 *
 *  returns {String}
 */
Utilities.prototype.getTimestamp = function() {
	return new Date().getTime().toString();
}

/**
 *  Returns the number of days since Epoch
 *
 *  returns {Number}
 */
Utilities.prototype.daysFromEpoch = function() {
	var current_date = new Date();
	var epocDate = new Date(new Date().getTime() / 1000);
	var res = Math.abs(current_date - epocDate) / 1000;
	var days = Math.floor(res / 86400);
	return days
}

/**
 *	@param {Date}  Date1
 *	@param {Date}  Date2
 *
 *  Returns the time difference between two dates in seconds
 *
 *  returns {Int}
 */
Utilities.prototype.secondsBetweenDates = function(date1, date2) {
	return Math.round((date1.getTime() - date2.getTime())/1000);
}

/**
 *	@param {Number} seconds
 *
 *  Returns a formated (HH:MM:SS) timetamp from a second
 *
 *  returns {String}
 */
Utilities.prototype.formatSecondsAsTime = function(seconds) {

	var hr  = Math.floor(seconds / 3600);
	var min = Math.floor((seconds - (hr * 3600))/60);
	var sec = Math.floor(seconds - (hr * 3600) -  (min * 60));

	if (hr < 10) hr = "0" + hr;
	if (min < 10) min = "0" + min;
	if (sec < 10) sec = "0" + sec;
	if (hr) hr = "00";

	return hr + ':' + min + ':' + sec;

}

var utilities = new Utilities();
