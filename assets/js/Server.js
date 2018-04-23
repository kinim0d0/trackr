class Server {

	/**
	 *	@param {String} url  url of the api
	 *	@param {Object} data  data in the req.body var
	 *	@param {Object} function  the function to call when the request is completed
	 *
	 *  Sends an api request to the server
	 */
	api(url, data, callback) {

		$(".server-error").remove();

		console.log("API");
		console.log(url);
		cl(data);

		var sync = $.ajax({

			type: "POST",
			url: url,
		    data: data,
		    timeout: 5000,
			dataType: "json",
			xhrFields: {
				withCredentials: true
			},

			success: function (data) {

				cl("API Success");
				cl(data);

				$(".error-msg").remove();

				if (callback != undefined) {
					callback(true, data);
				}

				$(".submit-btn").removeClass("disabled");

				setTimeout(function() {
					server.connectToSocket()
				})


			},

			error: function(data) {

				cl("API Error");
				cl(data);

				if (callback != undefined) {
					callback(false, data);
				}

				$(".submit-btn").removeClass("disabled");

			}

		})

	}

	/**
	 *	Starts a sync when the browser loaded
	 */
	 init(offset) {

		 var day = utilities.daysFromEpochToDate(timeline.currentDateFrom);
		 if (offset != undefined) {
			 day++;
		 }

		server.api("/sync/getDay", { day: day  }, function(success, data) {

			cl('SERVER GOT DAY', data)

			$('.loader-wrapper').addClass('hide');

			$('body').attr('data-view', data.view);

			tracker.renderDashboard(data);

		});

 	}

	initRange() {

		var from = utilities.daysFromEpochToDate(timeline.currentDateFrom);
		var to = utilities.daysFromEpochToDate(timeline.currentDateTo);

		server.api("/sync/getRange", { from: from, to: to  }, function(success, data) {

			cl('SERVER GOT RANGE', data)

			$('.loader-wrapper').addClass('hide');

			$('body').attr('data-view', data.view);

			tracker.renderStats(data);

		});

	}

	/**
	 *	Syncs the client's data with the database
	 */
	sync() {

		if (storage.state == undefined) {

			storage.state = {
				lastSync: 0,
				queue: []
			};

		}

		server.api("/sync", { lastSync: storage.state.lastSync || 0  }, server.syncEnd);

	}

	/**
	 *	Callback to sync, saves new data to localStorage
	 *
	 *  @param {Boolean} err  hasErrorOccured
	 *  @param {Object} data  Object  new data
	 */
	syncEnd(err, data) {

		var updates = data.log;

		for (var a = 0; a < updates.length; a += 2) {

			var id = updates[a]
			var update = updates[a+1];
			var	type = update.localId.substr(0,2)

			switch(type) {

				case "TR":
					tracker.saveToLocal(update);
					break;

				case "TI":
					tracker.saveTimerToLocal(update)
					break;

				case "TA":
					cl('Task')
					break;

				default:
					console.log("Unknown update type");
					break;

			}

		}

		storage.saveState();
		storage.state.lastSync = data.lastSync;
		storage.saveState();

		tracker.reloadList();

	}

	/**
	 *	Initializes a server object
	 */
	constructor() {
        this.socketConnection = false;
	}

	/**
	 *	Attempts to connect to socket.IO
	 */
	connectToSocket() {

		//return;

		if (server.socketConnection == true) {
			return;
		}

		server.socketConnection = true;

		cl("setting up socketIO");
		var socket = io('https://www.doentry.com/')

		socket.on('realTimeSyncStarted', function(data){
			cl("Connected to socket");
		  	cl(data);
		})

		socket.on('disconnect', function () {
			cl( 'disconnected from server' );
			server.socketConnection = false;
			setTimeout(function() {
				server.connectToSocket();
			}, 10000);
		} );

		var userId = $('body').attr('data-user-id');

		if ( (userId != "") && (userId != undefined) ) {

			socket.emit('startRealTimeSync', {
				userId: userId
			});

		}

		socket.on('update', function(update){
		 	setTimeout(function(){
		 		server.init();
		 	}, 300)
		});

	}

}

var server = new Server();

// Disables submit buttons on click until server respons to prevent multiple api requests for the same url
$("html").on("click touch", ".submit-btn", function(e) {

	if ($(this).hasClass("disabled")) {
		e.preventDefault();
		e.stopPropagation();
		e.stopImmediatePropagation();
	} else {
		$(this).addClass("disabled");
	}

})
