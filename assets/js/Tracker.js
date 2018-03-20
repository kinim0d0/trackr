class Tracker {

    /**
     *  @param {String} Enviroment
     *
     *  Toggles a tracker
     */
    toggle(localId) {

        console.log("Toggling tracker:  " + localId)

    }

    render(data) {

        $('.tracker-container').append('\
            <div class="tracker col-md-3" data-id="' + data.localId + '" data-color="' + data.color + '">\
                <div class="inner">\
                    <i class="fas tracker-dropdown-toggle fa-ellipsis-h more-dropdown"></i>\
                    <p class="name">' + data.name + '</p>\
                    <p class="time">0:00</p>\
                </div>\
            </div>\
        ')

    }

    reloadList() {

        $('.tracker-container').empty();

        cl(storage.trackers.list.length)

        for (var i = 0; i < storage.trackers.list.length; i++) {
            var localId = storage.trackers.list[i]
            this.render(storage.trackers[localId]);
        }

    }

    init() {

        this.reloadList();

    }

    renderEditModal($this, localId) {

        var dropdownTitle = "Add a new tracker";
        var trackerName = "";
        var trackerColor = "red";

        if (localId != undefined) {
            var tracker = storage.trackers[localId];
            dropdownTitle = "Edit";
            trackerName = tracker.name;
            trackerColor = tracker.color;
        } else {
            $this = $this.find('.dropdown');
        }

        $('.dropdown-menu').remove();

        $this
        .append('\
            <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">\
                <h2>' + dropdownTitle + '</h2>\
                <div class="form-group">\
                    <label>Name</label>\
                    <input class="name" type="text" value="' + trackerName + '">\
                </div>\
                <div class="form-group">\
                    <div class="color-picker">\
                        <span class="color" data-color="pink"></span>\
                        <span class="color" data-color="red"></span>\
                        <span class="color" data-color="yellow"></span>\
                        <span class="color" data-color="orange"></span>\
                        <span class="color" data-color="green"></span>\
                        <span class="color" data-color="blue"></span>\
                        <span class="color" data-color="purple"></span>\
                        <span class="color selected" data-color="grey"></span>\
                    </div>\
                </div>\
                <button class="submit-btn save-tracker-btn">Save</button>\
            </div>\
        ')
        .addClass('show')
        .find('.color[data-color="' + trackerColor + '"]')
            .addClass('selected');

    }

    save(data) {

        cl('saving', data);

        this.saveToLocal(data);

        server.api("tracker/edit", data, function (success, data) {

            cl("Tracker saved to server", success, data);

            tracker.reloadList();

            if (data["success"] == true) {

            } else {
                //$this.find(data["error"].field).first().after("<p class='server-error'>" + data["error"].msg + "</p>");
            }

        })

    }

    saveToLocal(data) {

        cl('saving to local', data)

        if (storage.trackers == null) {

            storage.trackers = {
            	list: []
            }

        }

        var loc = storage.trackers.list.indexOf(data.localId);

        if (loc > -1) {

            /*var inStorage = storage.trackers[data.localId];

            /*inStorage.name = data.name;
            inStorage.color = data.color;
            inStorage.localId = data.localId;
            inStorage.deleted = data.deleted;
            inStorage.isRunning = data.isRunning;*/

        } else {

            storage.trackers.list.push(data.localId);

        }

        storage.trackers[data.localId] = data;

        storage.saveState();

        tracker.reloadList();

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

    var localId = $this.attr('data-id');

    cl(localId)

    if ( (localId == undefined) || (localId == "") ) {
        cl('creating new')
        localId = 'TR' + utilities.generateLocalId();
    } else {
        cl('updating')
    }

    cl(localId);
    cl($this.parent())

    var data = {
        name: $this.find("input.name").first().val(),
        color: $this.find(".color-picker .color.selected").attr("data-color"),
        localId: localId,
        deleted: false,
        isRunning: false
    }

    tracker.save(data);

    $('.dropdown.show').removeClass('show');

})

$h.on('click touch', '.tracker-dropdown-toggle', function(e) {

    e.stopImmediatePropagation();

    var $this = $(this).parent().parent()
    var localId = $this.attr('data-id');

    console.log('work')
    tracker.renderEditModal($this, localId);

})
