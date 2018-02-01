const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MONTH_NAMES_ABBREV = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const TODAY = new Date();
const CURRENT_MONTH = TODAY.getMonth();
const CURRENT_YEAR = TODAY.getFullYear();
const PREVIOUS_MONTHS = getPreviousMonths();
const PREVIOUS_MONTH_YEARS = getPreviousMonthYears();
const COLORS = ['#33a02c', '#1f78b4', '#e31a1c', '#ff7f00', '#6a3d9a', '#a6cee3', '#fb9a99', '#fdbf6f', '#cab2d6', '#b2df8a', '#ffff99'];
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
<header class="panel-heading">${CURRENT_YEAR} Revenue</header>
<div class="panel-body">
<p style="padding-bottom: 15px;"><span class="col-lg-6"><b>Overall</b></span><span class="col-lg-6"><b>$<span data-overall="curr-year">0</span></b></span></p>
</div>
</section>
</div>
<div class="col-lg-4">
<section id="prev-year" class="panel panel-default">
<header class="panel-heading">${CURRENT_YEAR - 1} Revenue</header>
<div class="panel-body">
<p style="padding-bottom: 15px;"><span class="col-lg-6"><b>Overall</b></span><span class="col-lg-6"><b>$<span data-overall="prev-year">0</span></b></span></p>
</div>
</section>
</div>
<div class="col-lg-4">
<section id="curr-month" class="panel panel-default">
<header class="panel-heading">${MONTH_NAMES[CURRENT_MONTH] + ' ' + CURRENT_YEAR} Revenue</header>
<div class="panel-body">
<p style="padding-bottom: 15px;"><span class="col-lg-6"><b>Overall</b></span><span class="col-lg-6"><b>$<span data-overall="curr-month">0</span></b></span></p>
</div>
</section>
</div>
<div class="col-lg-4">
<section id="prev-month" class="panel panel-default">
<header class="panel-heading">${MONTH_NAMES[PREVIOUS_MONTHS[0]] + ' ' + PREVIOUS_MONTH_YEARS[0]} Revenue</header>
<div class="panel-body">
<p style="padding-bottom: 15px;"><span class="col-lg-6"><b>Overall</b></span><span class="col-lg-6"><b>$<span data-overall="prev-month">0</span></b></span></p>
</div>
</section>
</div>
<div class="col-lg-4">
<section id="prev-prev-month" class="panel panel-default">
<header class="panel-heading">${MONTH_NAMES[PREVIOUS_MONTHS[1]] + ' ' + PREVIOUS_MONTH_YEARS[1]} Revenue</header>
<div class="panel-body">
<p style="padding-bottom: 15px;"><span class="col-lg-6"><b>Overall</b></span><span class="col-lg-6"><b>$<span data-overall="prev-prev-month">0</span></b></span></p>
</div>
</section>
</div>
</div>
<div class="row">
<div class="col-lg-6">
<section id="twelve-months-revenue" class="panel panel-default">
<header class="panel-heading">${MONTH_NAMES[CURRENT_MONTH] + ' ' + (CURRENT_YEAR - 1) + " - " + MONTH_NAMES[PREVIOUS_MONTHS[0]] + ' ' + PREVIOUS_MONTH_YEARS[0]} Total Revenue</header>
<div class="panel-body">
<canvas id="twelve-months-revenue-chart"></canvas>
</div>
</section>
</div>
<div class="col-lg-6">
<section id="twelve-months-sales" class="panel panel-default">
<header class="panel-heading">${MONTH_NAMES[CURRENT_MONTH] + ' ' + (CURRENT_YEAR - 1) + " - " + MONTH_NAMES[PREVIOUS_MONTHS[0]] + ' ' + PREVIOUS_MONTH_YEARS[0]} Sales</header>
<div class="panel-body">
<canvas id="twelve-months-sales-chart"></canvas>
</div>
</section>
</div>
</div>
`;

let revenueTwelveMonths = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
let salesTwelveMonths = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
let pastTwelveMonthsNamesAbr = getPreviousMonthNames();
let twelveMonthsRevenueChart;
let twelveMonthsSalesChart;
let colorCount = 1;

$('nav.nav-primary > ul > li:nth-child(3) > ul').append(NAV_LIST_ITEM_HTML);

$('#premium-statistics').click(function() {
	$('#content > section > header > p').html('<i class="fa fa-code"></i> Scripter Panel | Premium Statistics');
	$('#content > section > section').html(PANELS_HTML);
	twelveMonthsRevenueChart = appendTwelveMonthsRevenueChart();
	twelveMonthsSalesChart = appendTwelveMonthsSalesChart();
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
			monthly: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			sales: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
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
							script[i].sales[j] += 1;
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

		let scriptRevenueTwelveMonths = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
		let scriptSalesTwelveMonths = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
		for (let i = 0; i < 12; i++) {
			let month = (i + 1) % 12;
			let year = month < CURRENT_MONTH ? CURRENT_YEAR : CURRENT_YEAR - 1;
			let revenue = script[year].monthly[month];
			revenueTwelveMonths[i] += revenue;
			revenueTwelveMonths[i] = Number(revenueTwelveMonths[i].toFixed(2));
			scriptRevenueTwelveMonths[i] = Number(revenue.toFixed(2));
			scriptSalesTwelveMonths[i] = script[year].sales[month];
		}

		let color = COLORS[colorCount];
		colorCount++;
		let scriptRevenueDataset = {
			label: name + ' Revenue',
			data: scriptRevenueTwelveMonths,
			fill: -1,
			borderColor: color,
			backgroundColor: color,
			borderWidth: 2,
			pointBackgroundColor: color,
			lineTension: 0
		}
		let scriptSalesDataset = {
			label: name + ' Sales',
			data: scriptSalesTwelveMonths,
			borderColor: color,
			backgroundColor: color,
			borderWidth: 1,
		}
		twelveMonthsRevenueChart.data.datasets.push(scriptRevenueDataset);
		twelveMonthsRevenueChart.update();
		twelveMonthsSalesChart.data.datasets.push(scriptSalesDataset);
		twelveMonthsSalesChart.update();

		let currMonthAvg = script[CURRENT_YEAR].monthly[CURRENT_MONTH] / TODAY.getDate();
		let prevMonthAvg = script[PREVIOUS_MONTH_YEARS[0]].monthly[PREVIOUS_MONTHS[0]] / getDaysInMonth(PREVIOUS_MONTHS[0], PREVIOUS_MONTH_YEARS[0]);
		let prevPrevMonthAvg = script[PREVIOUS_MONTH_YEARS[1]].monthly[PREVIOUS_MONTHS[1]] / getDaysInMonth(PREVIOUS_MONTHS[1], PREVIOUS_MONTH_YEARS[1]);
		let prevPrevPrevMonthAvg = script[PREVIOUS_MONTH_YEARS[2]].monthly[PREVIOUS_MONTHS[2]] / getDaysInMonth(PREVIOUS_MONTHS[2], PREVIOUS_MONTH_YEARS[2]);
		$('#total > div').append('<p style="padding-bottom: 15px;"><span class="col-lg-6">' + name + '</span><span class="col-lg-6">$' + script.total.toFixed(2) + '</span></p>');
		$('#curr-month > div').append('<p style="padding-bottom: 15px;"><span class="col-lg-6">' + name + '</span><span class="col-lg-3">$' + script[CURRENT_YEAR].monthly[CURRENT_MONTH].toFixed(2) + '</span><span class="col-lg-3">' + getPercentChange(currMonthAvg, prevMonthAvg) + '</span></p>');
		$('#prev-month > div').append('<p style="padding-bottom: 15px;"><span class="col-lg-6">' + name + '</span><span class="col-lg-3">$' + script[PREVIOUS_MONTH_YEARS[0]].monthly[PREVIOUS_MONTHS[0]].toFixed(2) + '</span><span class="col-lg-3">' + getPercentChange(prevMonthAvg, prevPrevMonthAvg) + '</span></p>');
		$('#prev-prev-month > div').append('<p style="padding-bottom: 15px;"><span class="col-lg-6">' + name + '</span><span class="col-lg-3">$' + script[PREVIOUS_MONTH_YEARS[1]].monthly[PREVIOUS_MONTHS[1]].toFixed(2) + '</span><span class="col-lg-3">' + getPercentChange(prevPrevMonthAvg, prevPrevPrevMonthAvg) + '</span></p>');
		$('#curr-year > div').append('<p style="padding-bottom: 15px;"><span class="col-lg-6">' + name + '</span><span class="col-lg-6">$' + script[CURRENT_YEAR].total.toFixed(2) + '</span></p>');
		$('#prev-year > div').append('<p style="padding-bottom: 15px;"><span class="col-lg-6">' + name + '</span><span class="col-lg-6">$' + script[CURRENT_YEAR - 1].total.toFixed(2) + '</span></p>');
		
		$('span[data-overall=total]').text((Number($('span[data-overall=total]').text()) + script.total).toFixed(2));
		$('span[data-overall=curr-month]').text((Number($('span[data-overall=curr-month]').text()) + script[CURRENT_YEAR].monthly[CURRENT_MONTH]).toFixed(2));
		$('span[data-overall=prev-month]').text((Number($('span[data-overall=prev-month]').text()) + script[PREVIOUS_MONTH_YEARS[0]].monthly[PREVIOUS_MONTHS[0]]).toFixed(2));
		$('span[data-overall=prev-prev-month]').text((Number($('span[data-overall=prev-prev-month]').text()) + script[PREVIOUS_MONTH_YEARS[1]].monthly[PREVIOUS_MONTHS[1]]).toFixed(2));
		$('span[data-overall=curr-year]').text((Number($('span[data-overall=curr-year]').text()) + script[CURRENT_YEAR].total).toFixed(2));
		$('span[data-overall=prev-year]').text((Number($('span[data-overall=prev-year]').text()) + script[CURRENT_YEAR - 1].total).toFixed(2));

		appendChart(script);
	}
}

function appendChart(script) {
	let chartId = script.name + ' Chart';
	let panel = `<div class="col-lg-6">
	<section class="panel panel-default">
	<header class="panel-heading">` + script.name + `</header>
	<div class="panel-body">
	<canvas id="` + chartId + `"></canvas>
	</div>
	</section>
	</div>`;
	$('#content > section > section').append(panel);
	let chart = new Chart(chartId, {
		type: 'bar',
		data: {
			labels: MONTH_NAMES_ABBREV,
			datasets: [{
				label: CURRENT_YEAR + ' Revenue',
				data: script[CURRENT_YEAR].monthly,
				backgroundColor: COLORS[1],
				borderColor: COLORS[1],
				borderWidth: 1
			},
			{
				label: (CURRENT_YEAR - 1) + ' Revenue',
				data: script[CURRENT_YEAR - 1].monthly,
				backgroundColor: COLORS[3],
				borderColor: COLORS[3],
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

function appendTwelveMonthsRevenueChart() {
	let chart = new Chart("twelve-months-revenue-chart", {
		type: 'line',
		data: {
			labels: pastTwelveMonthsNamesAbr,
			datasets: [{
				type: 'line',
				label: 'Total Revenue',
				data: revenueTwelveMonths,
				fill: -1,
				borderColor: COLORS[0],
				backgroundColor: COLORS[0],
				borderWidth: 2,
				pointBackgroundColor: COLORS[0],
				lineTension: 0
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
	return chart;
}

function appendTwelveMonthsSalesChart() {
	let chart = new Chart("twelve-months-sales-chart", {
		type: 'bar',
		data: {
			labels: pastTwelveMonthsNamesAbr
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
	return chart;
}

function getPreviousMonth(current, amount) {
	let diff = current - amount;
	return diff < 0 ? 12 + diff : diff;
}

function getPreviousMonthYear(current, previous) {
	return current >= previous ? CURRENT_YEAR : CURRENT_YEAR - 1;
}

function getDaysInMonth(month, year) {
	return new Date(year, month + 1, 0).getDate();
}

function getPercentChange(curr, prev) {
	let percent = curr / prev;
	return percent > 1.0 ? '<span style="color: green;">+' + ((percent - 1) * 100).toFixed(0) + '%</span>' : '<span style="color: red;">-' + ((1 - percent) * 100).toFixed(0) + '%</span>';
}

function getPreviousMonths() {
	months = [];
	for (let i = 1; i <= 12; i++) {
		months.push(getPreviousMonth(CURRENT_MONTH, i));
	}
	return months;
}

function getPreviousMonthYears() {
	years = [];
	for (let i = 1; i <= 12; i++) {
		years.push(getPreviousMonthYear(CURRENT_MONTH, PREVIOUS_MONTHS[i - 1]));
	}
	return years;
}

function getPreviousMonthNames() {
	months = [];
	for (let i = 0; i < 12; i++) {
		months.push(MONTH_NAMES_ABBREV[PREVIOUS_MONTHS[i]]);
	}
	months.reverse();
	return months;
}