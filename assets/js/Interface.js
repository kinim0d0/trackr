class Interface {

	/**
	 *	@param {String} selector Element to scroll to
	 *
	 *  Animated scroll to an element
	 */
	scrollTo(selector) {
		console.log(selector);
		$("html, body").animate({ scrollTop: $(selector).offset().top - 200 }, 400);
	}

}

var interface = new Interface();

$("html").on("click touch", ".scroll-to", function() { interface.scrollTo( $(this).attr("data-scroll") ) })

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

		var note = $(this).val();
		cl('adding note', note);
		$(this).val('');

	}

});
