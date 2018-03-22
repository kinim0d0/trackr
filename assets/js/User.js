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
$h.on("change", "#email", function() {
    $('#password, £password-again').val("");
})
