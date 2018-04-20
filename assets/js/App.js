class App {

    /**
     *  @param {String} Environment
     *
     *  Initializes the app
     */
    constructor(env) {

        this.env = env;
        this.IP;
        if (App.ENV == "LOCAL") {
            this.IP = "http://localhost:3000/";
            this.socketIP = "http://localhost:3002";
        } else {
            /*this.IP = ""
            this.socketIP = ""*/
        }

        console.log("App started " + env);

        if ( $('body').attr('data-page') == 'dashboard' ) {
            $('.loader-wrapper').removeClass('hide');
        }

        //storage.init();
        //tracker.init();
        server.init();

    }

}

var app;
//var app = new App("DEV");

$(document).ready(function() {

    app = new App("LOCAL");
    $('#daterange').daterangepicker();

})

var $h = $("html");

// Triggers actions on input enter
$("html").on("keyup", "input", function (e) {

    if ( (e.keyCode == 13) && ($(this).hasClass("on-enter")) ) {

        var action = $(this).attr("data-enter");

        switch(action) {

            case "trigger":
                var $element = $(this).attr("data-trigger");
                $element = $($element).first();
                $element.trigger("click");
                break;

        }

    }

});
