class Tracker {

    constructor() {
        this.updateInterval = null;
        this.currentTimer = null;
        this.runningTimer = null;
        this.loadedLogObjects = [];
        this.loadedTrackerObjects = [];
	}

    /**
     *  @param {String} localId  localId of the tracker
     *
     *  Toggles a tracker's state
     */
    addNote(note) {

        server.api('/tracker/addNote', {
            timer: tracker.currentTimer,
            note: note
        }, function(success, data) {
            cl('note added', success, data);
            server.init();
        })

    }

    /**
     *  @param {String} localId  localId of the tracker
     *
     *  Toggles a tracker's state
     */
    toggle(localId) {

        console.log("Toggling tracker:  " + localId);

        var $this = $('.tracker[data-id="' + localId + '"] .inner');

        if ($this.hasClass('active')) {

            // Stopping an already active trackers

            server.api('/tracker/stopTimer', {
                trackerId: localId,
                timer: tracker.currentTimer
            }, function(success, data) {
                cl('timer stopped', success, data);
                server.init();
            })

        } else {

            // Starting a new timer

            server.api('/tracker/addNewTimer', {
                trackerId: localId,
                localId: "TI" + utilities.generateLocalId()
            }, function(success, data) {
                cl('timer added', success, data);
                server.init();
            })

        }

        return;

        // Runs if there is a running timer, it saves the running timer
        if (tracker.runningTimer != null) {

            cl('saving current timer')

            var currentTimer = tracker.runningTimer;
            currentTimer.end = new Date();

            server.api("tracker/editTimer", currentTimer, function (success, data) {

                cl("Timer saved to server", success, data);

            })

            $('.tracker .inner').removeClass('active');

        }

        tracker.runningTimer = null;

        // Starts the new timer if another not active tracker was clicked
        if (localId != currentTimer.trackerId) {

            $this.addClass("active");
            tracker.runningTimer = {
                start: new Date(),
                end: null,
                localId: "TI" + utilities.generateLocalId()
            }

        }

    }

    /**
     *  @param {String} localId  localId of the tracker
     *
     *  Creates a timer
     */
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

    /**
     *  @param {String} localId  localId of the tracker
     *  @param {Object} localId  timer
     *
     *  Saves a timer
     */
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

    /**
     *  @param {Object} timer  timer
     *
     *  Saves a timer to the localStorage
     */
    saveTimerToLocal(timer) {

        cl('saving to local timer', timer);

        storage.trackers[timer.trackerId].days[timer.day][timer.localId] = timer;

        storage.saveState();

    }

    /**
     *  @param {String} localId  localId of the timer
     *
     *  Stops a timer, rewriting the current timer with an end date
     */
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

    /**
     *  Starts a timer (when it was started by someone else, or browser reloaded)
     */
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

    renderRunningTimestamp() {

        if (tracker.currentTimer != null) {

            cl('have active timer');

            if (tracker.updateInterval == null) {

                cl('dont have a running timer, starting now')

                this.updateInterval = setInterval(function() {

                    var now = new Date()
                    //now = now.getTime();
                    var startDate = new Date(tracker.currentTimer.start);

                    //return;

                    //if (typeof startDate == 'string') {
                    //    startDate = new Date(Date.parse(startDate))
                    //}

                    var secondsDiff = utilities.secondsBetweenDates(now, startDate);
                    var timestamp = utilities.formatSecondsAsTime(secondsDiff)

                    $('.tracker .inner.active').first().find('.time').text(timestamp);

                }, 1000)

            }

        }

    }

    /**
     *  @param {Object} tracker  tracker
     *
     *  Renders a tracker element
     */
    render(data, today) {

        if (data == undefined) {
            return;
        }

        var todaysTimers = data.days[today];
        var isRunningDOM = "";

        if (todaysTimers != undefined) {
            cl('oday days: ', todaysTimers);
            for (var i = 0; i < todaysTimers.length; i++) {
                if (todaysTimers[i].end == null) {
                    tracker.currentTimer = todaysTimers[i];
                    isRunningDOM = " active ";
                }
                todaysTimers[i].trackerId = data.localId;
                tracker.loadedLogObjects.push(todaysTimers[i]);
            }
        }

        clearInterval(tracker.updateInterval);
        tracker.updateInterval = null;
        tracker.renderRunningTimestamp();

        $('.tracker-container').append('\
            <div class="tracker col-md-3" data-id="' + data.localId + '" data-color="' + data.color + '">\
                <div class="inner ' + isRunningDOM + '">\
                    <i class="fas tracker-dropdown-toggle fa-ellipsis-h more-dropdown"></i>\
                    <p class="name">' + data.name + '</p>\
                    <p class="time">00:00:00</p>\
                </div>\
            </div>\
        ')

    }

    /**
     *  Reloads all the trackers
     */
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

    /**
     *  Runs when the browser is loaded
     */
    init() {
        //this.reloadList();
    }

    /**
     *  @param {Object} $this  The element to add the dropdown to
     *  @param {String} localId  localId of the tracker
     *
     *  Appends a dropdown to the given element
     */
    renderEditModal($this, localId) {

        var dropdownTitle = "Add a tracker";
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

        $('.dropdown-menu:not(.permanent)').remove();

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

    /**
     *  @param {Object} data  tracker
     *
     *  Saves a tracker to localStorage and to the database
     */
    save(data) {

        server.api("tracker/edit", data, function (success, data) {

            cl("Tracker saved to server", success, data);

            server.init();

            if (data["success"] == true) {

            } else {
                //$this.find(data["error"].field).first().after("<p class='server-error'>" + data["error"].msg + "</p>");
            }

        })

    }

    renderDashboard(data) {

        cl('rendering dashboard with', data);

        tracker.loadedLogObjects = [];
        tracker.loadedTrackerObjects = [];

        if (data.view == "day") {

            // Rendering trackers

            $('.task-container, .tracker-container, .log-container').empty();

            for (var i = 0; i < data.data.length; i++) {
                cl(data[i])
                tracker.render(data.data[i], data.day);
                tracker.loadedTrackerObjects.push(data.data[i]);
            }

            // Rendering Log

            tracker.loadedLogObjects.sort(utilities.dynamicSort("start"));

            for ( i = 0; i < tracker.loadedLogObjects.length; i++) {

                var logsTracker = null;

                for (var j = 0; j < tracker.loadedTrackerObjects.length; j++) {
                    if (tracker.loadedTrackerObjects[j].localId == tracker.loadedLogObjects[i].trackerId) {
                        logsTracker = tracker.loadedTrackerObjects[j];
                    }
                }

                //cl('Rendering LOG object', tracker.loadedLogObjects[i], logsTracker)

                var notesDOM = '';

                if (tracker.loadedLogObjects[i].notes != undefined) {

                    var notes = tracker.loadedLogObjects[i].notes;

                    for (j = 0; j < notes.length; j++) {

                        var note = notes[j];

                        notesDOM += '\
                            <div class="note">\
                                <p class="timestamp">' + utilities.getFormattedDate(note.timestamp, 'HHMM') + '</p>\
                                <p class="description">\
                                    ' + note.description + '\
                                </p>\
                                <i class="fas fa-pencil-alt edit-note"></i>\
                            </div>\
                        '
                    }

                }

                $('.log-container').prepend('\
                    <div class="log direct" data-border-color="' + logsTracker.color + '">\
                        <p class="title">' + logsTracker.name + '</p>\
                        <span class="time start">' + utilities.getFormattedDate(tracker.loadedLogObjects[i].start, 'HHMM') + '</span>\
                        ' + notesDOM + '\
                    </div>\
                ')

            }

        }

    }

}

var tracker = new Tracker;

// Triggers the state of a tracker
$("html").on("click touch", ".tracker .inner", function() {

    var $this = $(this);

    if ($this.parent().hasClass('disabled')) {
        return
    }

    tracker.toggle($(this).parent().attr("data-id"));

})

// Changes the selected color for the tracker
$h.on("click touch", ".color-picker .color", function() {

    var $this = $(this);

    if ($this.hasClass("selected"))
        return;

    $(".color-picker .color").removeClass("selected");

    $this.addClass("selected");

})

// Calls the tracker save function to save the tracker
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
        tasks: []
    }

    tracker.save(data);

    $('.dropdown.show').removeClass('show');

})

// Passes the element to add the dropdown to to the renderEditModal function
$h.on('click touch', '.tracker-dropdown-toggle', function(e) {

    e.stopImmediatePropagation();

    var $this = $(this).parent().parent()
    var localId = $this.attr('data-id');

    console.log('work')
    tracker.renderEditModal($this, localId);

})
