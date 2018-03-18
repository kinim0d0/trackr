class Server {

	/**
	 *	@param {String} url of the api
	 *	@param {Object} data in the $_POST var
	 *	@param {Object} function to call when request completed
	 *
	 *  Sends an api request
	 */
	api(url, data, callback) {

		$(".status, .status p").text("").removeClass("error").removeClass("success");

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