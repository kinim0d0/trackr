class Task {

    constructor() {
        this.reloadList();
    }

    render(data) {

        $('.task-container').append('\
			<div class="task col-md-3" data-color="' + data.color + '">\
				<div class="inner">\
                    <i class="fas tracker-dropdown-toggle fa-ellipsis-h more-dropdown"></i>\
					<div class="progress-pie-chart" data-percent="43">\
					  <div class="ppc-progress">\
					    <div class="ppc-progress-fill"></div>\
					  </div>\
					  <div class="ppc-percents">\
					    <div class="pcc-percents-wrapper">\
                          <span>' + data.name + '</span>\
					      <span>' + data.left + '</span>\
					    </div>\
					  </div>\
					</div>\
				</div>\
			</div>\
        ')

        var $ppc = $('.progress-pie-chart').last(),
        percent = parseInt($ppc.data('percent')),
        deg = 360*percent/100;
        if (percent > 50) {
          $ppc.addClass('gt-50');
        }
        $('.ppc-progress-fill').css('transform','rotate('+ deg +'deg)');
        $('.ppc-percents span.time').html(data.left + ' left');

    }

    renderEditModal($this) {

        var dropdownTitle = "Add a task";
        var taskName = "";
        var taskColor = "red";

        $('.dropdown-menu').remove();

        $this
        .append('\
            <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">\
                <h2>' + dropdownTitle + '</h2>\
                <div class="form-group">\
                    <label>Name</label>\
                    <input class="name" type="text" value="' + taskName + '">\
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
                <button class="submit-btn save-task-btn">Save</button>\
            </div>\
        ')
        .addClass('show')
        .find('.color[data-color="' + taskColor + '"]')
            .addClass('selected');

    }

    reloadList() {

        var todos = [
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

        }

    }

}

$h.on('click touch', '.task-dropdown-toggle', function(e) {

    e.stopImmediatePropagation();

    var $this = $(this).parent();

    task.renderEditModal($this);

})

$h.on('click touch', '.save-task-btn', function(e) {



})

var task = new Task();
