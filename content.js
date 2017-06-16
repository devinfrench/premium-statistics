var monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
var monthNamesShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
var today = new Date();
var month = today.getMonth();
var year = today.getFullYear();

var navButtonHTML = `<li>
<a href="javascript:void(0)">
<i class="fa fa-angle-right"></i><span>Premium Statistics</span>
</a>
</li>`;

var panelsHTML = `
<div class="row">
<div class="col-lg-3">
<section id="total-rev" class="panel panel-default">
<header class="panel-heading">Total Revenue</header>
<div class="panel-body">
</div>
</section>
</div>
<div class="col-lg-3">
<section id="current-month" class="panel panel-default">
<header class="panel-heading"></header>
<div class="panel-body">
</div>
</section>
</div>
<div class="col-lg-3">
<section id="prev-month-1" class="panel panel-default">
<header class="panel-heading"></header>
<div class="panel-body">
</div>
</section>
</div>
<div class="col-lg-3">
<section id="prev-month-2" class="panel panel-default">
<header class="panel-heading"></header>
<div class="panel-body">
</div>
</section>
</div>
</div>
`;

var scripterPanelNav = $('#nav > section > section > div > div.slim-scroll > nav > ul > li:nth-child(3) > ul');
scripterPanelNav.append(navButtonHTML);

var navButton = $('#nav > section > section > div > div.slim-scroll > nav > ul > li > ul > li:nth-child(5) > a').click(function() {
	$('#content > section > header > p').html('<i class="fa fa-code"></i> Scripter Panel | Premium Statistics');
	$('#content > section > section').html(panelsHTML);
	$('#current-month > header').text(monthNames[month] + ' ' + year + ' Revenue');
	$('#prev-month-1 > header').text(monthNames[getPreviousMonth(month, 1)] + ' ' + year + ' Revenue');
	$('#prev-month-2 > header').text(monthNames[getPreviousMonth(month, 2)] + ' ' + year + ' Revenue');
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
		let prevMonth1 = 0;
		let prevMonth2 = 0;
		let prevMonth3 = 0;
		$.each(logs, function(key, value) {
			if (value.status !== "REVERSED") {
				let amount = Number(value.amount);
				total += amount;
				if (value.time.includes(monthNamesShort[month] + ' ' + year)) {
					currMonth += amount;
				} else if (value.time.includes(monthNamesShort[getPreviousMonth(month, 1)] + ' ' + year)) {
					prevMonth1 += amount;
				} else if (value.time.includes(monthNamesShort[getPreviousMonth(month, 2)] + ' ' + year)) {
					prevMonth2 += amount;
				} else if (value.time.includes(monthNamesShort[getPreviousMonth(month, 3)] + ' ' + year)) {
					prevMonth3 += amount;
				}
			}
		});
		let currMonthAvg = currMonth / daysInMonth(month, year);
		let prevMonth1Avg = prevMonth1 / daysInMonth(getPreviousMonth(month, 1), year);
		let prevMonth2Avg = prevMonth2 / daysInMonth(getPreviousMonth(month, 2), year);
		let prevMonth3Avg = prevMonth3 / daysInMonth(getPreviousMonth(month, 3), year);
		$('#total-rev > div').append('<p style="padding-bottom: 15px;"><span class="col-lg-6">' + name + '</span><span class="col-lg-6">$' + total.toFixed(2) + '</span></p>');
		$('#current-month > div').append('<p style="padding-bottom: 15px;"><span class="col-lg-6">' + name + '</span><span class="col-lg-3">$' + currMonth.toFixed(2) + '</span><span class="col-lg-3">' + getPercentChange(currMonthAvg, prevMonth1Avg) + '</span></p>');
		$('#prev-month-1 > div').append('<p style="padding-bottom: 15px;"><span class="col-lg-6">' + name + '</span><span class="col-lg-3">$' + prevMonth1.toFixed(2) + '</span><span class="col-lg-3">' + getPercentChange(prevMonth1Avg, prevMonth2Avg) + '</span></p>');
		$('#prev-month-2 > div').append('<p style="padding-bottom: 15px;"><span class="col-lg-6">' + name + '</span><span class="col-lg-3">$' + prevMonth2.toFixed(2) + '</span><span class="col-lg-3">' + getPercentChange(prevMonth2Avg, prevMonth3Avg) + '</span></p>');
	}
}

function getPreviousMonth(current, amount) {
	let diff = current - amount;
	return diff < 0 ? 12 + diff : diff;
}

function daysInMonth(month, year) {
	return new Date(year, month, 0).getDate();
}

function getPercentChange(curr, prev) {
	let percent = curr / prev;
	return percent > 1.0 ? '<span style="color: green;">+' + ((percent / 1) * 100).toFixed(0) + '%</span>' : '<span style="color: red;">-' + ((1 - percent) * 100).toFixed(0) + '%</span>';
}