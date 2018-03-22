class User {

}

var user = new User;

// Opens the login-signup modal and focuses to the email field
$h.on("click touch", ".login-modal-open-btn", function() {
    $("#login-wrapper").toggleClass("hide");
    $("#email").focus();
})

// Closes the login-signup wrapper
$h.on('click touch', '#login-close', function(e) {
    $("#login-wrapper").toggleClass("hide");
})

// Clears password fields on email field change
$h.on("keyup", "#email", function() {
    $('#password, #password-again').val("");
})

//Sends an api request to log the user in
$("html").on("click touch", ".login-btn", function() {

	var fields = {
		email: $("#email").val(),
		password: $("#password").val(),
		passwordAgain: $("#password-again").val()
	};

	server.api("/user/login", fields, function(success, data) {

		success = data["success"];

		//$(".password-group").addClass("hide");

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
