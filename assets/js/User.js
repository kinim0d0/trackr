class User {

}

var user = new User;

$("html").on("click touch", ".login-modal-open-btn", function() {

    $("#login-wrapper").toggleClass("hide");

    $("#email").focus();

})