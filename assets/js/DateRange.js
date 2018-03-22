class Timeline {

    /**
     *  @param {String} Enviroment
     *
     *  Initializes the app
     */
    constructor(env) {

        this.updateTimelineDate(moment());

    }

    reloadCharts() {

        var ctx = document.getElementById('main-chart').getContext('2d');
        var myPieChart = new Chart(ctx,{
            type: 'pie',
            data: {
                datasets: [{
                    data: [10, 25, 30],
                    backgroundColor: ['#FFDD5C', '#76A665', '#928181']
                }],

                // These labels appear in the legend and in the tooltips when hovering different arcs
                labels: [
                    'Work',
                    'Study',
                    'Movies'
                ]
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

    }

    updateTimelineDate(dateFrom, dateTo) {

        var $singleRange = $('.date-range .single-range');
        var $multiRange = $('.date-range .multi-range');

        var $multiDaySections = $('section.stats, section.tracker-stats, section.task-stats');
        var $singleDaySections = $('section.trackers, section.tasks')

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

            $('.date-range').addClass("multi");

            $multiDaySections.removeClass('hide')
            $singleDaySections.addClass('hide')

            timeline.reloadCharts();

        } else {

            $multiDaySections.addClass('hide')
            $singleDaySections.removeClass('hide')

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

$("html").on("click touch", ".date-range .tracker", function (e) {

    e.stopImmediatePropagation();

   $(this).find('.add-note').focus();

});

$("html").on("click touch", ".applyBtn", function (e) {

    var range = $('#daterange').val();

    var fromDate = range.substr(0, 10);
    var toDate = range.substr(13, 23);

    timeline.updateTimelineDate(fromDate, toDate)

})

$("html").on("click touch", ".back-to-day", function (e) {

    e.stopImmediatePropagation();

    timeline.updateTimelineDate(moment())

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

$(document).ready(function() {


})
