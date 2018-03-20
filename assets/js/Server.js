class Server {

	/**
	 *	@param {String} url of the api
	 *	@param {Object} data in the $_POST var
	 *	@param {Object} function to call when request completed
	 *
	 *  Sends an api request
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
	 *	Returns a $_GET attribute from the document's body
	 *
	 *  @param {String} name name of the data attribute
	 *
	 *  @returns {String}
	 */
	getParam(name) {
		return $("body").attr("data-" + name);
	}

	init() {
		this.sync()
	}

	sync() {

		if (storage.state == undefined) {

			storage.state = {
				lastSync: 0,
				queue: []
			};

		}

		server.api("/sync", { lastSync: storage.state.lastSync || 0  }, server.syncEnd);

	}

	syncEnd(err, data) {

		var updates = data.log;

		for (var a = 0; a < updates.length; a++) {

			var update = updates[a];
			if (update == undefined) continue;
			var type;
			if (update.localId != undefined) {
				type = update.localId.substr(0,2)
			}

			console.log(update);

			switch(type) {

				case "TR":
					tracker.saveToLocal(update);
					break;

				case "TI":
					cl('Tracked time')
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

	constructor() {
        this.socketConnection = false;
	}

	connectToSocket() {

		if (server.socketConnection == true) {
			return;
		}

		server.socketConnection = true;

		cl("setting up socketIO");
		var socket = io('http://localhost:3002')

		socket.on('realTimeSyncStarted', function(data){
			cl("Connected to socket");
		  	cl(data);
		})

		socket.on('disconnect', function () {
			cl( 'disconnected from server' );
			server.socketConnection = false;
			setTimeout(function() {
				server.connectToSocket();
			}, 5000);
		} );

		socket.emit('startRealTimeSync', {
			userId: '5aae59242c44323f9c8763b1',
			sessionId: '123'
		});

		socket.on('update', function(update){
		 	setTimeout(function(){
		 		server.sync();
		 	}, 300)
		});

	}

}

var server = new Server();

//Sends an api request to log the user in
$("html").on("click touch", ".login-btn", function() {

	var fields = {
		email: $("#email").val(),
		password: $("#password").val(),
		passwordAgain: $("#password-again").val()
	};

	server.api("/user/login", fields, function(success, data) {

		success = data["success"];

		$(".password-group").addClass("hide");

		if (success == true) {

			if (data.data.view == "loggedIn") {
				location.href = "/dashboard";
			} else if (data.data.view == "signup") {
				$(".password-group").removeClass("hide");
			} if (data.data.view == "login") {
				$(".password-group:not(.password-again)").removeClass("hide");
			}

			$("#password").focus();

		} else {

			if (data.error != undefined) {
				$(data.error.field).parent().append("<label class='error-msg'>" + data.error.msg + "</label>");
			}

		}

	});

})

// Triggers actions on input enter
$("input").on('keyup', function (e) {

    if ( (e.keyCode == 13) && ($(this).hasClass("on-enter")) ) {

    	var action = $(this).attr("data-enter");

    	switch(action) {

    		case "trigger":
    			console.log("trigger");
    			var $element = $(this).attr("data-trigger");
    			$element = $($element).first();
    			$element.trigger("click");
    			break;

    		default:
    			console.log("Unkown action");
    			break;

    	}

    }

});

// Disables submit buttons on click until server respons to prevent multiple form submissions
$("html").on("click touch", ".submit-btn", function(e) {

	if ($(this).hasClass("disabled")) {
		e.preventDefault();
		e.stopPropagation();
		e.stopImmediatePropagation();
	} else {
		$(this).addClass("disabled");
	}

})
