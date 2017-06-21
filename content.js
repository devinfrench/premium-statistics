const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MONTH_NAMES_ABBREV = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const TODAY = new Date();
const CURRENT_MONTH = TODAY.getMonth();
const CURRENT_YEAR = TODAY.getFullYear();

const NAV_LIST_ITEM_HTML = `
<li>
<a id="premium-statistics" href="javascript:void(0)">
<i class="fa fa-angle-right"></i><span>Premium Statistics</span>
</a>
</li>
`;

const PANELS_HTML = `
<div class="row">
<div class="col-lg-4">
<section id="total" class="panel panel-default">
<header class="panel-heading">Total Revenue</header>
<div class="panel-body">
<p style="padding-bottom: 15px;"><span class="col-lg-6"><b>Overall</b></span><span class="col-lg-6"><b>$<span>0</span></b></span></p>
</div>
</section>
</div>
<div class="col-lg-4">
<section id="curr-year" class="panel panel-default">
<header class="panel-heading"></header>
<div class="panel-body">
<p style="padding-bottom: 15px;"><span class="col-lg-6"><b>Overall</b></span><span class="col-lg-6"><b>$<span>0</span></b></span></p>
</div>
</section>
</div>
<div class="col-lg-4">
<section id="prev-year" class="panel panel-default">
<header class="panel-heading"></header>
<div class="panel-body">
<p style="padding-bottom: 15px;"><span class="col-lg-6"><b>Overall</b></span><span class="col-lg-6"><b>$<span>0</span></b></span></p>
</div>
</section>
</div>
<div class="col-lg-4">
<section id="curr-month" class="panel panel-default">
<header class="panel-heading"></header>
<div class="panel-body">
<p style="padding-bottom: 15px;"><span class="col-lg-6"><b>Overall</b></span><span class="col-lg-6"><b>$<span>0</span></b></span></p>
</div>
</section>
</div>
<div class="col-lg-4">
<section id="prev-month" class="panel panel-default">
<header class="panel-heading"></header>
<div class="panel-body">
<p style="padding-bottom: 15px;"><span class="col-lg-6"><b>Overall</b></span><span class="col-lg-6"><b>$<span>0</span></b></span></p>
</div>
</section>
</div>
<div class="col-lg-4">
<section id="prev-prev-month" class="panel panel-default">
<header class="panel-heading"></header>
<div class="panel-body">
<p style="padding-bottom: 15px;"><span class="col-lg-6"><b>Overall</b></span><span class="col-lg-6"><b>$<span>0</span></b></span></p>
</div>
</section>
</div>
</div>
`;

$('#nav > section > section > div > div.slim-scroll > nav > ul > li:nth-child(3) > ul').append(NAV_LIST_ITEM_HTML);

$('#premium-statistics').click(function() {
	$('#content > section > header > p').html('<i class="fa fa-code"></i> Scripter Panel | Premium Statistics');
	$('#content > section > section').html(PANELS_HTML);
	$('#curr-month > header').text(MONTH_NAMES[CURRENT_MONTH] + ' ' + CURRENT_YEAR + ' Revenue');
	$('#prev-month > header').text(MONTH_NAMES[getPreviousMonth(CURRENT_MONTH, 1)] + ' ' + CURRENT_YEAR + ' Revenue');
	$('#prev-prev-month > header').text(MONTH_NAMES[getPreviousMonth(CURRENT_MONTH, 2)] + ' ' + CURRENT_YEAR + ' Revenue');
	$('#curr-year > header').text(CURRENT_YEAR + ' Revenue');
	$('#prev-year > header').text((CURRENT_YEAR - 1) + ' Revenue');
	getScripts();
});

function getScripts() {
	$.ajax({
		type: 'GET',
		url: 'https://tribot.org/repository/data/scripter_panel/published_scripts',
		success: function(data) {
			getPurchaseLogs(data);
		}
	});
}

function getPurchaseLogs(data) {
	$.each($.parseJSON(data).aaData, function(key, value) {
		if (value.actions.includes('Purchase Logs')) {
			$.ajax({
				type: 'GET',
				url: 'https://tribot.org/repository/index.php/data/scripter_panel/purchase_logs/' + value.id + '/',
				success: function(data) {
					appendRevenue(value.name, $.parseJSON(data).aaData);
				}
			});
		}
	});
}

function appendRevenue(name, logs) {
	if (logs.length > 2) {
		let total = 0;
		let currMonth = 0;
		let prevMonth = 0;
		let prevPrevMonth = 0;
		let prevPrevPrevMonth = 0;
		let currYear = 0;
		let prevYear = 0;
		$.each(logs, function(key, value) {
			if (value.status !== "REVERSED") {
				let amount = Number(value.amount);
				total += amount;
				if (value.time.includes(MONTH_NAMES_ABBREV[CURRENT_MONTH] + ' ' + CURRENT_YEAR)) {
					currMonth += amount;
				} else if (value.time.includes(MONTH_NAMES_ABBREV[getPreviousMonth(CURRENT_MONTH, 1)] + ' ' + CURRENT_YEAR)) {
					prevMonth += amount;
				} else if (value.time.includes(MONTH_NAMES_ABBREV[getPreviousMonth(CURRENT_MONTH, 2)] + ' ' + CURRENT_YEAR)) {
					prevPrevMonth += amount;
				} else if (value.time.includes(MONTH_NAMES_ABBREV[getPreviousMonth(CURRENT_MONTH, 3)] + ' ' + CURRENT_YEAR)) {
					prevPrevPrevMonth += amount;
				}
				if (value.time.includes(CURRENT_YEAR)) {
					currYear += amount;
				} else if (value.time.includes(CURRENT_YEAR - 1)) {
					prevYear += amount;
				}
			}
		});
		let currMonthAvg = currMonth / TODAY.getDate();
		let prevMonthAvg = prevMonth / getDaysInMonth(getPreviousMonth(CURRENT_MONTH, 1), CURRENT_YEAR);
		let prevPrevMonthAvg = prevPrevMonth / getDaysInMonth(getPreviousMonth(CURRENT_MONTH, 2), CURRENT_YEAR);
		let prevPrevPrevMonthAvg = prevPrevPrevMonth / getDaysInMonth(getPreviousMonth(CURRENT_MONTH, 3), CURRENT_YEAR);
		$('#total > div').append('<p style="padding-bottom: 15px;"><span class="col-lg-6">' + name + '</span><span class="col-lg-6">$' + total.toFixed(2) + '</span></p>');
		$('#curr-month > div').append('<p style="padding-bottom: 15px;"><span class="col-lg-6">' + name + '</span><span class="col-lg-3">$' + currMonth.toFixed(2) + '</span><span class="col-lg-3">' + getPercentChange(currMonthAvg, prevMonthAvg) + '</span></p>');
		$('#prev-month > div').append('<p style="padding-bottom: 15px;"><span class="col-lg-6">' + name + '</span><span class="col-lg-3">$' + prevMonth.toFixed(2) + '</span><span class="col-lg-3">' + getPercentChange(prevMonthAvg, prevPrevMonthAvg) + '</span></p>');
		$('#prev-prev-month > div').append('<p style="padding-bottom: 15px;"><span class="col-lg-6">' + name + '</span><span class="col-lg-3">$' + prevPrevMonth.toFixed(2) + '</span><span class="col-lg-3">' + getPercentChange(prevPrevMonthAvg, prevPrevPrevMonthAvg) + '</span></p>');
		$('#curr-year > div').append('<p style="padding-bottom: 15px;"><span class="col-lg-6">' + name + '</span><span class="col-lg-6">$' + currYear.toFixed(2) + '</span></p>');
		$('#prev-year > div').append('<p style="padding-bottom: 15px;"><span class="col-lg-6">' + name + '</span><span class="col-lg-6">$' + prevYear.toFixed(2) + '</span></p>');
		
		$('#total > div > p:nth-child(1) > span:nth-child(2) > b > span').text((Number($('#total-rev > div > p:nth-child(1) > span:nth-child(2) > b > span').text()) + total).toFixed(2));
		$('#curr-month > div > p:nth-child(1) > span:nth-child(2) > b > span').text((Number($('#current-month > div > p:nth-child(1) > span:nth-child(2) > b > span').text()) + currMonth).toFixed(2));
		$('#prev-month > div > p:nth-child(1) > span:nth-child(2) > b > span').text((Number($('#prev-month-1 > div > p:nth-child(1) > span:nth-child(2) > b > span').text()) + prevMonth).toFixed(2));
		$('#prev-prev-month > div > p:nth-child(1) > span:nth-child(2) > b > span').text((Number($('#prev-month-2 > div > p:nth-child(1) > span:nth-child(2) > b > span').text()) + prevPrevMonth).toFixed(2));
		$('#curr-year > div > p:nth-child(1) > span:nth-child(2) > b > span').text((Number($('#current-year > div > p:nth-child(1) > span:nth-child(2) > b > span').text()) + currYear).toFixed(2));
		$('#prev-year > div > p:nth-child(1) > span:nth-child(2) > b > span').text((Number($('#prev-year > div > p:nth-child(1) > span:nth-child(2) > b > span').text()) + prevYear).toFixed(2));
	}
}

function getPreviousMonth(current, amount) {
	let diff = current - amount;
	return diff < 0 ? 12 + diff : diff;
}

function getDaysInMonth(month, year) {
	return new Date(year, month, 0).getDate();
}

function getPercentChange(curr, prev) {
	let percent = curr / prev;
	return percent > 1.0 ? '<span style="color: green;">+' + ((percent / 1) * 100).toFixed(0) + '%</span>' : '<span style="color: red;">-' + ((1 - percent) * 100).toFixed(0) + '%</span>';
}