class Tracker {

    constructor() {
        this.updateInterval = null;
        this.currentTimer = null;
	}

    /**
     *  @param {String} Enviroment
     *
     *  Toggles a tracker
     */
    toggle(localId) {

        console.log("Toggling tracker:  " + localId);

        var stopped = false;

        $('.tracker .inner.active').each(function() {
            var id = $(this).parent().attr('data-id');
            if (id != localId) {
                tracker.stopTimer(id);
                stopped = true;
            }
        })

        if ( (!stopped) && (tracker.updateInterval != null) ) {
            //this.stopTimer(localId)
        } else {
            this.createTimer(localId);
        }

    }

    createTimer(localId) {

        cl('starting: ' + localId);

        var dateNow = new Date();

        var timer = {
            start: dateNow,
            end: null,
            notes: [],
            localId: "TI" + utilities.generateLocalId(),
            trackerId: localId,
            day: utilities.daysFromEpoch(utilities.getTimestamp())
        }

        this.saveTimer(localId, timer)

    }

    saveTimer(localId, timer) {

        var daysSinceEpoch = timer.day;
        cl(daysSinceEpoch)

        var tracker = storage.trackers[localId];

        if (tracker == undefined) {
            tracker = {

            }
        }

        if (tracker.days[daysSinceEpoch] == undefined) {
            tracker.days[daysSinceEpoch] = {}
        }

        var day = tracker.days[daysSinceEpoch];
        day[timer.localId] = timer;

        cl(tracker[daysSinceEpoch]);
        cl(storage.trackers[localId])

        storage.saveState();

        // save to server

        server.api("tracker/editTimer", timer, function (success, data) {

            cl("Timer saved to server", success, data);

        })

        this.currentTimer = timer;

        this.startTimer();

    }

    saveTimerToLocal(timer) {

        cl('saving to local timer', timer);

        storage.trackers[timer.trackerId].days[timer.day][timer.localId] = timer;

        storage.saveState();

    }

    stopTimer(localId) {

        console.log('Stopping: ');
        cl(localId);
        $('.tracker[data-id="'+ localId + '"] .inner').removeClass('active');

        clearInterval(this.updateInterval);

        var timer = this.currentTimer;
        timer.end = new Date();

        var tracker = storage.trackers[localId];
        var day = tracker.days[timer.day];
        day[timer.localId] = timer;
        cl(tracker, day, timer);

        //storage.trackers[localId][timer.day][timer.localId] = timer

        storage.saveState();

        this.currentTimer = null;

    }

    startTimer() {

        cl('start timer ()')

        if (tracker.updateInterval == null) {

            cl('starting timer', tracker.currentTimer)

            this.updateInterval = setInterval(function() {

                var now = new Date()
                var startDate = tracker.currentTimer.start;

                if (typeof startDate == 'string') {
                    startDate = new Date(Date.parse(startDate))
                    //cl(startDate)
                }

                var secondsDiff = utilities.secondsBetweenDates(now, startDate);
                var timestamp = utilities.formatSecondsAsTime(secondsDiff)

                $('.tracker .inner.active').first().find('.time').text(timestamp);

                //cl('timestamp update', timestamp)

            }, 1000)

        }

    }

    //TODO render on blur and focus

    render(data) {

        if (data == undefined) {
            return;
        }

        $('.tracker-container').append('\
            <div class="tracker col-md-3" data-id="' + data.localId + '" data-color="' + data.color + '">\
                <div class="inner">\
                    <i class="fas tracker-dropdown-toggle fa-ellipsis-h more-dropdown"></i>\
                    <p class="name">' + data.name + '</p>\
                    <p class="time">00:00:00</p>\
                </div>\
            </div>\
        ')

    }

    reloadList() {

        if (storage.trackers == undefined) {
            storage.trackers = {
        		list: []
        	}
        }

        $('.tracker-container').empty();

        for (var i = 0; i < storage.trackers.list.length; i++) {

            var localId = storage.trackers.list[i];
            var trackerInt = storage.trackers[localId];

            if ( (trackerInt == undefined) || (trackerInt.days == undefined) )
                continue;

            var todaysTimers = trackerInt.days[utilities.daysFromEpoch()];

            cl(trackerInt, 'Trackers timers for today: ', todaysTimers, '---');

            this.render(trackerInt);

            if (todaysTimers != undefined) {

                for (var key in todaysTimers) {

                    if (todaysTimers.hasOwnProperty(key)) {

                        var timer = todaysTimers[key];
                        cl(timer)
                        if ( (timer.end == null) || (timer.end == "") ) {
                            cl('found unended', timer)
                            tracker.currentTimer = timer;
                            clearInterval(this.updateInterval);
                            $('.tracker[data-id="' + timer.trackerId + '"] .inner').addClass('active');
                            //debugger
                            tracker.updateInterval = null;
                            tracker.startTimer();
                        }

                    }

                }

            }

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

    tracker.toggle($(this).parent().attr("data-id"));

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

    if ( (localId == undefined) || (localId == "") ) {
        cl('creating new')
        localId = 'TR' + utilities.generateLocalId();
    } else {
        cl('updating')
    }

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
