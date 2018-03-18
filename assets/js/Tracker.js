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

$h.on("click touch", ".color-picker .color", function() {

    var $this = $(this);

    if ($this.hasClass("selected"))
        return;

    $(".color-picker .color").removeClass("selected");

    $this.addClass("selected");

})

$h.on("click touch", ".save-tracker-btn", function() {

    var $this = $(this).parent().parent();

    var data = {
        name: $this.find("input.name").first().val(),
        color: $this.find(".color-picker .color.selected").attr("data-color"),
        localId: utilities.generateLocalId(),
        deleted: false
    }

    server.api("tracker/edit", data, function (success, data) {

        cl("Tracker saved to server", success, data);

        if (data["success"] == true) {

        } else {
            $this.find(data["error"].field).first().after("<p class='server-error'>" + data["error"].msg + "</p>");
        }

    })

    $this.parent().removeClass("show");

})