class Tracker {

    /**
     *  @param {String} Enviroment
     *
     *  Toggles a tracker
     */
    toggle(localId) {

        console.log("Toggling tracker:  " + localId)

    }

}

var tracker = new Tracker;

$("html").on("click touch", ".tracker .inner", function() {

    var $this = $(this);

    if ($this.hasClass("active")) {
        $this.removeClass("active");
    } else {
        $this.addClass("active");
    }

    tracker.toggle($(this).attr("data-id"));

})