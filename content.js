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
<p style="padding-bottom: 15px;"><span class="col-lg-6"><b>Overall</b></span><span class="col-lg-6"><b>$<span data-overall="total">0</span></b></span></p>
</div>
</section>
</div>
<div class="col-lg-4">
<section id="curr-year" class="panel panel-default">
<header class="panel-heading"></header>
<div class="panel-body">
<p style="padding-bottom: 15px;"><span class="col-lg-6"><b>Overall</b></span><span class="col-lg-6"><b>$<span data-overall="curr-year">0</span></b></span></p>
</div>
</section>
</div>
<div class="col-lg-4">
<section id="prev-year" class="panel panel-default">
<header class="panel-heading"></header>
<div class="panel-body">
<p style="padding-bottom: 15px;"><span class="col-lg-6"><b>Overall</b></span><span class="col-lg-6"><b>$<span data-overall="prev-year">0</span></b></span></p>
</div>
</section>
</div>
<div class="col-lg-4">
<section id="curr-month" class="panel panel-default">
<header class="panel-heading"></header>
<div class="panel-body">
<p style="padding-bottom: 15px;"><span class="col-lg-6"><b>Overall</b></span><span class="col-lg-6"><b>$<span data-overall="curr-month">0</span></b></span></p>
</div>
</section>
</div>
<div class="col-lg-4">
<section id="prev-month" class="panel panel-default">
<header class="panel-heading"></header>
<div class="panel-body">
<p style="padding-bottom: 15px;"><span class="col-lg-6"><b>Overall</b></span><span class="col-lg-6"><b>$<span data-overall="prev-month">0</span></b></span></p>
</div>
</section>
</div>
<div class="col-lg-4">
<section id="prev-prev-month" class="panel panel-default">
<header class="panel-heading"></header>
<div class="panel-body">
<p style="padding-bottom: 15px;"><span class="col-lg-6"><b>Overall</b></span><span class="col-lg-6"><b>$<span data-overall="prev-prev-month">0</span></b></span></p>
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
	let script = {
		name: name,
		total: 0
	};

	for (let i = CURRENT_YEAR - 1; i <= CURRENT_YEAR ; i++) {
		script[i] = {
			total: 0,
			monthly: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
		}
	}

	if (logs.length > 2) {
		$.each(logs, function(key, value) {
			if (value.status !== "REVERSED") {
				let amount = Number(value.amount);
				script.total += amount;
				for (let i = CURRENT_YEAR - 1; i <= CURRENT_YEAR ; i++) {
					for (let j = 0; j < MONTH_NAMES_ABBREV.length; j++) {
						if (value.time.includes(MONTH_NAMES_ABBREV[j] + ' ' + i)) {
							script[i].monthly[j] += amount;
							script[i].total += amount;
						}
					}
				}
			}
		});

		// Round all monthly values to 2 decimal places for chart
		for (let i = CURRENT_YEAR - 1; i <= CURRENT_YEAR ; i++) {
			for (let j = 0; j < MONTH_NAMES_ABBREV.length; j++) {
				script[i].monthly[j] = Number(script[i].monthly[j].toFixed(2));
			}
		}


		let currMonthAvg = script[CURRENT_YEAR].monthly[CURRENT_MONTH] / TODAY.getDate();
		let prevMonthAvg = script[CURRENT_YEAR].monthly[getPreviousMonth(CURRENT_MONTH, 1)] / getDaysInMonth(getPreviousMonth(CURRENT_MONTH, 1), CURRENT_YEAR);
		let prevPrevMonthAvg = script[CURRENT_YEAR].monthly[getPreviousMonth(CURRENT_MONTH, 2)]  / getDaysInMonth(getPreviousMonth(CURRENT_MONTH, 2), CURRENT_YEAR);
		let prevPrevPrevMonthAvg = script[CURRENT_YEAR].monthly[getPreviousMonth(CURRENT_MONTH, 3)]  / getDaysInMonth(getPreviousMonth(CURRENT_MONTH, 3), CURRENT_YEAR);
		$('#total > div').append('<p style="padding-bottom: 15px;"><span class="col-lg-6">' + name + '</span><span class="col-lg-6">$' + script.total.toFixed(2) + '</span></p>');
		$('#curr-month > div').append('<p style="padding-bottom: 15px;"><span class="col-lg-6">' + name + '</span><span class="col-lg-3">$' + script[CURRENT_YEAR].monthly[CURRENT_MONTH].toFixed(2) + '</span><span class="col-lg-3">' + getPercentChange(currMonthAvg, prevMonthAvg) + '</span></p>');
		$('#prev-month > div').append('<p style="padding-bottom: 15px;"><span class="col-lg-6">' + name + '</span><span class="col-lg-3">$' + script[CURRENT_YEAR].monthly[getPreviousMonth(CURRENT_MONTH, 1)].toFixed(2) + '</span><span class="col-lg-3">' + getPercentChange(prevMonthAvg, prevPrevMonthAvg) + '</span></p>');
		$('#prev-prev-month > div').append('<p style="padding-bottom: 15px;"><span class="col-lg-6">' + name + '</span><span class="col-lg-3">$' + script[CURRENT_YEAR].monthly[getPreviousMonth(CURRENT_MONTH, 2)].toFixed(2) + '</span><span class="col-lg-3">' + getPercentChange(prevPrevMonthAvg, prevPrevPrevMonthAvg) + '</span></p>');
		$('#curr-year > div').append('<p style="padding-bottom: 15px;"><span class="col-lg-6">' + name + '</span><span class="col-lg-6">$' + script[CURRENT_YEAR].total.toFixed(2) + '</span></p>');
		$('#prev-year > div').append('<p style="padding-bottom: 15px;"><span class="col-lg-6">' + name + '</span><span class="col-lg-6">$' + script[CURRENT_YEAR - 1].total.toFixed(2) + '</span></p>');
		
		$('span[data-overall=total]').text((Number($('span[data-overall=total]').text()) + script.total).toFixed(2));
		$('span[data-overall=curr-month]').text((Number($('span[data-overall=curr-month]').text()) + script[CURRENT_YEAR].monthly[CURRENT_MONTH]).toFixed(2));
		$('span[data-overall=prev-month]').text((Number($('span[data-overall=prev-month]').text()) + script[CURRENT_YEAR].monthly[getPreviousMonth(CURRENT_MONTH, 1)]).toFixed(2));
		$('span[data-overall=prev-prev-month]').text((Number($('span[data-overall=prev-prev-month]').text()) + script[CURRENT_YEAR].monthly[getPreviousMonth(CURRENT_MONTH, 2)]).toFixed(2));
		$('span[data-overall=curr-year]').text((Number($('span[data-overall=curr-year]').text()) + script[CURRENT_YEAR].total).toFixed(2));
		$('span[data-overall=prev-year]').text((Number($('span[data-overall=prev-year]').text()) + script[CURRENT_YEAR - 1].total).toFixed(2));

		appendChart(script);
	}
}

function appendChart(script) {
	let chartId = script.name.replace(' ', '') + 'Chart';
	let panel = `<div class="col-lg-6">
	<section class="panel panel-default">
	<header class="panel-heading">` + script.name + `</header>
	<div class="panel-body">
	<canvas id="` + chartId + `"></canvas>
	</div>
	</section>
	</div>`;
	$('#content > section > section').append(panel);
	let char = new Chart(chartId, {
		type: 'bar',
		data: {
			labels: MONTH_NAMES_ABBREV,
			datasets: [{
				label: CURRENT_YEAR + ' Revenue',
				data: script[CURRENT_YEAR].monthly,
				backgroundColor: 'rgba(54, 162, 235, 0.2)',
				borderColor: 'rgba(54, 162, 235, 1)',
				borderWidth: 1
			},
			{
				label: (CURRENT_YEAR - 1) + ' Revenue',
				data: script[CURRENT_YEAR - 1].monthly,
				backgroundColor: 'rgba(255, 159, 64, 0.2)',
				borderColor: 'rgba(255, 159, 64, 1)',
				borderWidth: 1
			}]
		},
		options: {
			scales: {
				yAxes: [{
					ticks: {
						beginAtZero:true
					}
				}]
			}
		}
	});
}

function getPreviousMonth(current, amount) {
	let diff = current - amount;
	return diff < 0 ? 12 + diff : diff;
}

function getDaysInMonth(month, year) {
	return new Date(year, month + 1, 0).getDate();
}

function getPercentChange(curr, prev) {
	let percent = curr / prev;
	return percent > 1.0 ? '<span style="color: green;">+' + ((percent - 1) * 100).toFixed(0) + '%</span>' : '<span style="color: red;">-' + ((1 - percent) * 100).toFixed(0) + '%</span>';
}