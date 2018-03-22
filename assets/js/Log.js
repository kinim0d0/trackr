class Log {

}

/**
 *	@param {Object} e  Element to trigger the contenteditable on
 *
 *  Toggles the contenteditable attribute on an element
 */
function toggleContentEditable(e) {
    var a = 'contenteditable';
    var v= e.attr(a);
    e.attr(a,!v);
    if (!v) e.focus();
}

// Passes an element to the toggleContentEditable function
$h.on('click touch', '.edit-timer', function(e) {
    toggleContentEditable($(this).parent().find('.title'))
})

// Passes an element to the toggleContentEditable function
$h.on('click touch', '.edit-note', function(e) {
    toggleContentEditable($(this).parent().find('.description'))
})

// Adds a note element to a timer and focuses on the description element
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
