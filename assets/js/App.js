class App {

    /**
     *  @param {String} Enviroment
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

        console.log("App started " + env)

    }

}

var app;
//var app = new App("DEV");

$(document).ready(function() {
    app = new App("LOCAL");
})