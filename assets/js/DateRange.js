class Timeline {

    /**
     *  @param {String} Enviroment
     *
     *  Initializes the app
     */
    constructor(env) {

        this.updateTimelineDate(moment());

    }

    updateTimelineDate(dateFrom, dateTo) {

        var $singleRange = $('.date-range .single-range');
        var $multiRange = $('.date-range .multi-range');

        if (typeof dateFrom == 'string') {

            dateFrom = moment(dateFrom);

            if (dateTo != undefined) {
                dateTo = moment(dateTo);
            }

        }

        $('.date-range').removeClass("multi")

        $singleRange.find('.day').text(dateFrom.date())
        $singleRange.find('.weekday').text(dateFrom.format("dddd")).removeClass('hide')
        $singleRange.find('.month').text(dateFrom.format("MMMM"));
        $singleRange.find('.year').text(dateFrom.year())

        $multiRange.addClass('hide');

        if (dateTo != undefined) {

            $singleRange.find('.weekday').addClass('hide');

            $multiRange.removeClass('hide');

            $multiRange.find('.day').text(dateTo.date())
            $multiRange.find('.month').text(dateTo.format("MMMM"));
            $multiRange.find('.year').text(dateTo.year())

            $('.date-range').addClass("multi")

        }

    }

}

var timeline = new Timeline();

// Triggers actions on input enter
$("html").on("click touch", ".date-range", function (e) {

   $("#daterange").focus();

});

$("html").on("click touch", ".date-range .next-day, .date-range .prev-day", function (e) {

    e.stopImmediatePropagation();

   console.log('updating date')

});

$("html").on("click touch", ".applyBtn", function (e) {

    var range = $('#daterange').val();

    var fromDate = range.substr(0, 10);
    var toDate = range.substr(13, 23);


    cl(fromDate, toDate, fromDate == toDate)

    if (fromDate == toDate) {
        timeline.updateTimelineDate(fromDate)
    } else {
        timeline.updateTimelineDate(fromDate, toDate)
    }

})

$(window).scroll(function() {

	var currentScroll = $(this).scrollTop();
	var offset = 100;

	if (currentScroll > offset) {
		$("body").attr('data-timeline', 'sticky');
	} else {
		$("body").attr('data-timeline', 'normal');
	}

});
