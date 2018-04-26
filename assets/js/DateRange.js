class Timeline {

    /**
     *  @param {String} Enviroment
     *
     *  Initializes the app
     */
    constructor(env) {

        this.updateTimelineDate(moment());
        this.currentDateFrom = moment();
        this.currentDateTo = undefined;

    }

    /**
     *  Reloads the charts with the data in the current range
     */
    reloadCharts(names, minutes, colors) {

        setTimeout(function() {

            var ctx = $('#main-chart')[0].getContext('2d');

            var myPieChart = new Chart(ctx,{

                type: 'pie',
                data: {

                    datasets: [{
                        data: minutes,
                        backgroundColor: colors
                    }],

                    labels: names

                },

                options: {
                    segmentShowStroke : true,
                    segmentStrokeColor : "#fff",
                    segmentStrokeWidth : 2,
                    percentageInnerCutout : 50,
                    animationSteps : 100,
                    animationEasing : "easeOutBounce",
                    animateRotate : true,
                    animateScale : false,
                    responsive: true,
                    maintainAspectRatio: true,
                    showScale: true
                }

            });

        }, 200)

    }

    /**
     *  @param {String|Date} dateFrom  the range's start date
     *  @param {String|Date} dateTo  the range's end date
     *
     *  Upldates statistics based on the current date range
     */
    updateTimelineDate(dateFrom, dateTo) {

        if (dateFrom == dateTo) {
            dateTo = undefined;
        }

        var $singleRange = $('.date-range .single-range');
        var $multiRange = $('.date-range .multi-range');

        var $multiDaySections = $('section.stats');
        var $singleDaySections = $('section.trackers, section.tasks, section.log')

        if (typeof dateFrom == 'string') {

            dateFrom = moment(dateFrom);

            if (dateTo != undefined) {
                dateTo = moment(dateTo);
            }

        }

        this.currentDateFrom = dateFrom;
        this.currentDateTo = dateTo;

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

            $('.date-range').addClass("multi");

            $multiDaySections.removeClass('hide')
            $singleDaySections.addClass('hide')

            timeline.reloadCharts();

            server.initRange();

        } else {

            $multiDaySections.addClass('hide')
            $singleDaySections.removeClass('hide')

            if (server != undefined)
                server.init(1);

        }

    }

}

var timeline = new Timeline();

// Triggers the date-range picker on range header click
$("html").on("click touch", ".date-range", function (e) {

   $("#daterange").focus();

});

// Focuses on the add note to timer input element
$("html").on("click touch", ".date-range .tracker", function (e) {

    e.stopImmediatePropagation();

   $(this).find('.add-note').focus();

});

// Gets and passes the date range to the updateTimelineDate function
$("html").on("click touch", ".applyBtn", function (e) {

    var range = $('#daterange').val();

    var fromDate = range.substr(0, 10);
    var toDate = range.substr(13, 23);

    timeline.updateTimelineDate(fromDate, toDate)

})

// Resets the date range to today's day view
$("html").on("click touch", ".back-to-day", function (e) {

    e.stopImmediatePropagation();

    window.location.reload();

    //timeline.updateTimelineDate(moment())

    //server.init(1);

})

// Event triggered when the window is scrolled
$(window).scroll(function() {

	var currentScroll = $(this).scrollTop();
	var offset = 100;

    // Makes the date range header fixed when the user scrolled down 100 pixels
	if (currentScroll > offset) {
		$("body").attr('data-timeline', 'sticky');
	} else {
		$("body").attr('data-timeline', 'normal');
	}

});

$(document).ready(function() {


})
