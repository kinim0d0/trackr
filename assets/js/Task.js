class Task {

    /**
     *  Initializes a Task object
     */
    constructor() {
        this.reloadList();
    }

    /**
     *  @param {Object} data  task
     *
     *  Renders a task element
     */
    render(data) {

        var tasksTracker = null;
        cl('www', data, tracker.loadedTrackerObjects, tracker.loadedTrackerObjects.length)


        for (var i = 0; i < tracker.loadedTrackerObjects.length; i++) {
            cl(tracker.loadedTrackerObjects[i].localId, 'vs', data.trackerId)
            if (tracker.loadedTrackerObjects[i].localId == data.trackerId) {
                tasksTracker = tracker.loadedTrackerObjects[i];
            }
        }

        $('.task-container').append('\
            <div class="task clearfix" data-id="' + data.localId + '" data-color="' + tasksTracker.color + '" data-tracker-id="' + tasksTracker.localId + '">\
                <div class="main">\
                    <p class="name">' + data.name + '</p>\
                    <p class="timeleft">3 hours</p>\
                </div>\
                <div class="list">\
                    <ul class="scroll scroll--simple">\
                        <li class="hide">\
                            <label>\
                                <input type="checkbox">\
                                <i></i>\
                                <span>12312</span>\
                                <a>Remove</a>\
                            </label>\
                        </li>\
                    </ul>\
                    <input type="text" class="todo-new show-on-hover" placeholder="New Item">\
                    <i class="remove-task far fa-trash-alt"></i>\
                </div>\
            </div>\
        ')

    }

    /**
     *  @param {Object} $this  The element to add the dropdown to
     *
     *  Appends a dropdown to the given task
     */
    renderEditModal($this) {

        var dropdownTitle = "Add a task";
        var taskName = "";
        var taskColor = "red";

        $('.dropdown-menu:not(.permanent)').remove();

        var trackersDOM = "";

        for (var i = 0; i < tracker.loadedTrackerObjects.length; i++) {
            trackersDOM += "<option data-value='" + tracker.loadedTrackerObjects[i].localId + "'>" + tracker.loadedTrackerObjects[i].name + "</option>";
        }

        $this
        .append('\
            <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">\
                <h2>' + dropdownTitle + '</h2>\
                <div class="form-group">\
                    <label>Name</label>\
                    <input class="name" type="text" value="' + taskName + '">\
                </div>\
                <div class="form-group">\
                    <label>Tracker</label>\
                    <select>\
                        ' + trackersDOM + '\
                    </select>\
                </div>\
                <button class="submit-btn save-task-btn">Save</button>\
            </div>\
        ')
        .addClass('show')
        .find('.color[data-color="' + taskColor + '"]')
            .addClass('selected');

    }

    /**
     *  Reloads all the tasks
     */
    reloadList() {

        /*var todos = [
            {
                name: 'task1',
                todos: [
                    'todo1',
                    'todo2'
                ],
                left: '12m',
                color: 'red'
            },
            {
                name: 'task2',
                todos: [
                    'todo1',
                    'todo2'
                ],
                left: '12m',
                color: 'pink'
            },
            {
                name: 'task3',
                todos: [
                    'todo1',
                    'todo2'
                ],
                left: '12m',
                color: 'yellow'
            },
            {
                name: 'task4',
                todos: [
                    'todo1',
                    'todo2'
                ],
                left: '15m',
                color: 'orange'
            },
            {
                name: 'task5',
                todos: [
                    'todo1',
                    'todo2'
                ],
                left: '12m',
                color: 'green'
            },
            {
                name: 'task6',
                todos: [
                    'todo1',
                    'todo2'
                ],
                left: '12m',
                color: 'blue'
            },
            {
                name: 'task7',
                todos: [
                    'todo1',
                    'todo2'
                ],
                left: '12m',
                color: 'purple'
            },
            {
                name: 'task8',
                todos: [
                    'todo1',
                    'todo2'
                ],
                left: '12m',
                color: 'grey'
            }
        ]

        $('.task-container').empty();

        for (var i = 0; i < todos.length; i++) {

            this.render(todos[i]);

        }*/

    }

    save(data) {

        cl('saving task', data);

        server.api('/tracker/addTask', {
            task: data,
            day: utilities.daysFromEpochToDate(timeline.currentDateFrom)
        }, function(success, data) {
            cl('note added', success, data);
            server.init();
        })

    }

}

// Toggles the dropdown for a task
$h.on('click touch', '.task-dropdown-toggle', function(e) {

    e.stopImmediatePropagation();

    var $this = $(this).parent();

    task.renderEditModal($this);

})

$h.on('click touch', '.save-task-btn', function(e) {

    var $this = $(this).parent().parent();

    var localId = $this.attr('data-id');

    if ( (localId == undefined) || (localId == "") ) {
        cl('creating new')
        localId = 'TA' + utilities.generateLocalId();
    } else {
        cl('updating')
    }

    var data = {
        name: $this.find("input.name").first().val(),
        localId: localId,
        trackerId: $this.find('select').first().find('option:selected').attr('data-value'),
        deleted: false,
        todos: []
    }

    task.save(data);

    $('.dropdown.show').removeClass('show');

})

$("html").on("click touch", ".remove-task", function(e){

    var $task = $(this).parent().parent();

    server.api('/tracker/removeTask', {
        trackerId: $task.attr('data-tracker-id'),
        day: utilities.daysFromEpochToDate(timeline.currentDateFrom),
        taskId: $task.attr('data-id')
    }, function(success, data) {
        cl('removed task', success, data);
        server.init();
    })

})

$("html").on("keypress", ".todo-new", function(e){
	var code = (e.keyCode ? e.keyCode : e.which);
	if(code == 13) {
	  var v = $(this).val();
	  var s = v.replace(/ +?/g, '');
	  if (s == ""){
	    return false;
	  }else{
	    $(this).parent().find('ul').first().append("<li><label><input type='checkbox'><i></i><span>"+ v +"</span><a>Remove</a></label></li>");
	    $(this).val("");
        cl('added todo');
	  }
	}
});


$("html").on("click touch", ".list li a", function(){
	var cardId = $(this).parent().parent().parent().parent().parent().parent().attr('data-id');
	var _li = $(this).parent().parent();
    _li.addClass("remove").stop().delay(100).slideUp("fast", function(){
      _li.remove();
      cl('removed task')
    });
});

$("html").on("change", ".list li input", function(e){
	cl('test', ($(e.target).is('a')));
	if ($(e.target).is('a')) return
    cl('change state')
});

var task = new Task();
