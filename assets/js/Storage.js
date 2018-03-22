function Storage() {

	this.user = {};

	this.state = {
		lastSync: 0,
		queue: []
	}

	this.trackers = {
		list: []
		/*
		localId: {
			name,
			color
			days: {

			}
		}
		*/
	}

}

/**
 *	Loads the content of localStorage to memory
 */
Storage.prototype.init = function() {

	storage.user = JSON.parse(localStorage.getItem("user"));
	storage.state = JSON.parse(localStorage.getItem("state"));
	storage.trackers = JSON.parse(localStorage.getItem("trackers"));
	cl(storage)

}

/**
 *	Loads the content of the momory into localStorage
 */
Storage.prototype.saveState = function() {

	localStorage.setItem("user", JSON.stringify(storage.user));
	localStorage.setItem("trackers", JSON.stringify(storage.trackers));
	localStorage.setItem("state", JSON.stringify(storage.state));
	cl('Storage Updated', storage)

}

/**
 *	Erases localStorage
 */
Storage.prototype.destroy = function() {

	window.localStorage.clear();

	storage.user = {};

	storage.state = {
		lastSync: 0,
		queue: []
	};

	storage.trackers = {
		list: []
	}

}

var storage = new Storage();
