class Interface {

	/**
	 *	@param {String} selector  Element to scroll to
	 *	@param {Boolean} noOffset  scrolls to the element without any offset
	 *
	 *  Animated scroll to an element
	 */
	scrollTo(selector, noOffset) {
		var offset = 200
		if (noOffset) offset = 0
		$("html, body").animate({ scrollTop: $(selector).offset().top - offset }, 400);
	}

}

var interface = new Interface();

// Scrolls to an element
$("html").on("click touch", ".scroll-to", function() {
	interface.scrollTo( $(this).attr("data-scroll"), $(this).hasClass("no-offset") )
})

// Triggers actions on input enter
$("input").on('keyup', function (e) {

    if ( (e.keyCode == 13) && ($(this).hasClass("on-enter")) ) {

    	var action = $(this).attr("data-enter");

    	switch(action) {

    		case "trigger":
    			console.log("trigger");
    			var $element = $(this).attr("data-trigger");
    			$element = $($element).first();
    			$element.trigger("click");
    			break;

    		default:
    			console.log("Unkown action");
    			break;

    	}

    }

	if ( (e.keyCode == 13) && ($(this).hasClass("add-note")) ) {

		if ( $('.tracker .inner.active').length == 0 ) {
			alert('You have to start a tracker to add a note to it');
			return;
		}

		var note = $(this).val();
		tracker.addNote(note)
		$(this).val('');

	}

});

// Toggles a dropdown
$("html").on("click touch", ".dropdown-toggle", function() {
    $(this).parent().toggleClass("show");
})
