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

Storage.prototype.init = function(key) {

	storage.user = JSON.parse(localStorage.getItem("user"));
	storage.state = JSON.parse(localStorage.getItem("state"));
	storage.trackers = JSON.parse(localStorage.getItem("trackers"));

}

Storage.prototype.saveState = function() {

	localStorage.setItem("user", JSON.stringify(storage.user));
	localStorage.setItem("trackers", JSON.stringify(storage.trackers));
	localStorage.setItem("state", JSON.stringify(storage.state));

}

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