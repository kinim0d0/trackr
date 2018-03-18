class Timeline {

    /**
     *  @param {String} Enviroment
     *
     *  Initializes the app
     */
    constructor(env) {

    }

}

var timeline = new Timeline();

// Triggers actions on input enter
$("html").on("click touch", ".date-range", function (e) {

   $("#daterange").focus();

});