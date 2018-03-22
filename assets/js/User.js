class User {

}

var user = new User;

$h.on("click touch", ".login-modal-open-btn", function() {

    $("#login-wrapper").toggleClass("hide");

    $("#email").focus();

})

$h.on('click touch', '#login-wrapper', function(e) {
    $("#login-wrapper").toggleClass("hide");
})
