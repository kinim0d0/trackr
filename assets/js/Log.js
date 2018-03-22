class Log {

}

function toggleContentEditable(e) {
    var a = 'contenteditable';
    var v= e.attr(a);
    e.attr(a,!v);
    if (!v) e.focus();
}

$h.on('click touch', '.edit-timer', function(e) {

    var $this = $(this);

    toggleContentEditable($this.parent().find('.title'))

})

$h.on('click touch', '.edit-note', function(e) {

    var $this = $(this);

    toggleContentEditable($this.parent().find('.description'))

})

$h.on('click touch', '.add-note-to-timer', function(e) {

    var $this = $(this);

    $this.parent().append('\
        <div class="note">\
            <p class="timestamp">13:45</p>\
            <p class="description"> </p>\
            <i class="fas fa-pencil-alt edit-note"></i>\
        </div>\
    ')
    setTimeout(function() {
        toggleContentEditable($this.parent().find('.edit-note').last());
    }, 100)


})

var log = new Log();
