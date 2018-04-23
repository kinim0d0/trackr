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

Utilities.prototype.dynamicSort =  function(property) {

    var sortOrder = 1;

    if(property[0] === "-") {
        sortOrder = -1;
        property = property.substr(1);
    }

    return function (a,b) {
        var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
        return result * sortOrder;
    }

}

Utilities.prototype.daysFromEpochToDate = function(date) {
	var current_date = new Date(date);
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

	sec = ""

	return hr + ':' + min + '' + sec;

}

Utilities.prototype.getFormattedDate = function(dateObj, format) {

	var str = new Date();

	if (dateObj != undefined) {
		str = new Date(dateObj);
	}

	var dateStr = "";
	var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

	switch (format) {

		case "MDD":
			dateStr = monthNames[str.getMonth()] + " " + str.getDate();
			break;

		case "HHMM":
			var hours = str.getHours();
			if (hours < 10) hours = "0" + hours
			var minutes = str.getMinutes();
			if (minutes < 10) minutes = "0" + minutes
			dateStr = hours + ":" + minutes;
			break;

		case "Y":
			dateStr = str.getFullYear();
			break;

		case "M":
			dateStr = monthNames[str.getMonth()];
			break;

		case "D":
			dateStr = str.getDate();
			break;

		default:
			dateStr = str.getFullYear() + "-" + (str.getMonth()+1) + "-" + str.getDate() + " " + str.getHours() + ":" + str.getMinutes()
			break;

	}

	return dateStr;

}

var utilities = new Utilities();
