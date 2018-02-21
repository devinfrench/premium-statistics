const COLORS = [
    "#33a02c", "#1f78b4", "#e31a1c", "#ff7f00", "#6a3d9a", "#a6cee3",
    "#fb9a99", "#fdbf6f", "#cab2d6", "#b2df8a", "#ffff99"
  ];

class PurchaseLog {

    constructor(name, data, calender) {
        this.name = name;
        this.calender = calender;
        this.previousTwelveMonths = this.calender.getPreviousTwelveMonths();
        this.log = this._initLog();
        this.total = 0;
        this._populateLog(data);
    }

    _initLog() {
        let log = new Array(this.calender.getYear() - 2013);
        for (let i = 0; i < log.length; i++) {
            log[i] = {
                total: 0,
                revenue: new Array(12).fill(0),
                sales: new Array(12).fill(0)
            }
        }
        return log;
    }

    _populateLog(data) {
        let self = this; // required for jQuery each
        $.each(data, function (key, value) {
            if (value.status !== "REVERSED") {
                let amount = Number(value.amount);
                self.total += amount;
                for (let i = 0; i < self.log.length; i++) {
                    let year = self.calender.getYear() - i;
                    for (let j = 0; j < 12; j++) {
                        if (value.time.includes(`${Calender.getMonthNameAbbrev(j)} ${year}`)) {
                            self.log[i].revenue[j] += amount;
                            self.log[i].total += amount;
                            self.log[i].sales[j] += 1;

                            // Round values to 2 decimal places
                            self.log[i].revenue[j] = Math.round(self.log[i].revenue[j] * 100) / 100;
                            self.log[i].total = Math.round(self.log[i].total * 100) / 100;
                        }
                    }
                }
            }
        });
        self.total = Math.round(self.total * 100) / 100;
    }

    _getPastYearRevenue() {
        let yearRevenue = new Array(12);
        for (let i = 11; i >= 0; i--) {
            let year = this.calender.getYear() - this.previousTwelveMonths.year[i];
            let month = this.previousTwelveMonths.month[i];
            let revenue = this.log[year].revenue[month];
            if (revenue > 0) {
                yearRevenue[i] = revenue;
            }
        }
        return yearRevenue;
    }

    _getPastYearSales() {
        let yearSales = new Array(12);
        for (let i = 11; i >= 0; i--) {
            let year = this.calender.getYear() - this.previousTwelveMonths.year[i];
            let month = this.previousTwelveMonths.month[i];
            let sales = this.log[year].sales[month];
            if (sales > 0) {
                yearSales[i] = sales;
            }
        }
        return yearSales;
    }

    render(pastYearCharts) {
        this._renderTables();
        this._renderChart();
        this._renderPastYearChart(pastYearCharts);
    }

    _renderTables() {
        let $tablesModule = $("#script-tables-module");
        let template = $tablesModule.find("#script-table-row-template").html();
        this._renderTotal(template);
        this._renderCurrentYear(template);
        this._renderPreviousYear(template);
        this._renderCurrentMonth(template);
        this._renderPreviousMonth1(template);
        this._renderPreviousMonth2(template);
    }

    _renderTotal(template) {
        let revenue = this.total;
        let $overall = $("span[data-overall=total]")
        $overall.text(((Number($overall.text()) + revenue).toFixed(2)));
        let $el = $("#total > div");
        let view = {
            name: this.name,
            revenue: revenue.toFixed(2)
        }
        $el.append(Mustache.render(template, view));
    }

    _renderCurrentYear(template) {
        let revenue = this.log[0].total;
        let $overall = $("span[data-overall=current-year]")
        $overall.text(((Number($overall.text()) + revenue).toFixed(2)));
        let $el = $("#current-year > div");
        let view = {
            name: this.name,
            revenue: revenue.toFixed(2)
        }
        $el.append(Mustache.render(template, view));
    }

    _renderPreviousYear(template) {
        let revenue = this.log[1].total;
        let $overall = $("span[data-overall=previous-year]")
        $overall.text(((Number($overall.text()) + revenue).toFixed(2)));
        let $el = $("#previous-year > div");
        let view = {
            name: this.name,
            revenue: revenue.toFixed(2)
        }
        $el.append(Mustache.render(template, view));
    }

    _renderCurrentMonth(template) {
        let year = this.calender.getYear() - this.calender.getYear();
        let month = this.calender.getMonth();
        let revenue = this.log[year].revenue[month];
        let currentMonthAvg = this.log[year].revenue[month] / this.calender.getDay();
        year = this.calender.getYear() - this.calender.getYear(1);
        month = this.calender.getMonth(1);
        let previousMonthAvg = this.log[year].revenue[month] / this.calender.getDaysInMonth(month, year);
        let $overall = $("span[data-overall=current-month]")
        $overall.text(((Number($overall.text()) + revenue).toFixed(2)));
        let $el = $("#current-month > div");
        let view = {
            name: this.name,
            revenue: revenue.toFixed(2),
            change: this._getPercentChange(currentMonthAvg, previousMonthAvg)
        }
        $el.append(Mustache.render(template, view));
    }

    _renderPreviousMonth1(template) {
        let year = this.calender.getYear() - this.calender.getYear(1);
        let month = this.calender.getMonth(1);
        let revenue = this.log[year].revenue[month];
        let previousMonth1Avg = this.log[year].revenue[month] / this.calender.getDaysInMonth(month, year);
        year = this.calender.getYear() - this.calender.getYear(2);
        month = this.calender.getMonth(2);
        let previousMonth2Avg = this.log[year].revenue[month] / this.calender.getDaysInMonth(month, year);
        let $overall = $("span[data-overall=previous-month]")
        $overall.text(((Number($overall.text()) + revenue).toFixed(2)));
        let $el = $("#previous-month > div");
        let view = {
            name: this.name,
            revenue: revenue.toFixed(2),
            change: this._getPercentChange(previousMonth1Avg, previousMonth2Avg)
        }
        $el.append(Mustache.render(template, view));
    }

    _renderPreviousMonth2(template) {
        let year = this.calender.getYear() - this.calender.getYear(2);
        let month = this.calender.getMonth(2);
        let revenue = this.log[year].revenue[month];
        let previousMonth2Avg = this.log[year].revenue[month] / this.calender.getDaysInMonth(month, year);
        year = this.calender.getYear() - this.calender.getYear(3);
        month = this.calender.getMonth(3);
        let previousMonth3Avg = this.log[year].revenue[month] / this.calender.getDaysInMonth(month, year);
        let $overall = $("span[data-overall=previous-month-2]")
        $overall.text(((Number($overall.text()) + revenue).toFixed(2)));
        let $el = $("#previous-month-2 > div");
        let view = {
            name: this.name,
            revenue: revenue.toFixed(2),
            change: this._getPercentChange(previousMonth2Avg, previousMonth3Avg)
        }
        $el.append(Mustache.render(template, view));
    }

    _getPercentChange(current, previous) {
        let percent = current / previous;
        let el = "<span>0%</span>";
        if (percent > 1.0) {
            el = `<span style="color: green;">+${((percent - 1) * 100).toFixed(0)}%</span>`;
        } else if (percent > 0.0) {
            el = `<span style="color: red;">-${((1 - percent) * 100).toFixed(0)}%</span>`;
        }
        return el;
    }

    _renderChart() {
        let $chartsModule = $("#script-charts-module");
        let template = $chartsModule.find("#script-chart-template").html();
        let chartId = `${this.name.replace(/ /g, "-")}-chart`;
        let view = {
            name: this.name,
            chartId: chartId
        }
        $chartsModule.append(Mustache.render(template, view));
        let chart = new Chart(chartId, {
            type: "bar",
            data: {
                labels: Calender.MONTH_NAMES_ABBREV,
                datasets: [{
                    label: `${this.calender.getYear()} Revenue`,
                    data: this.log[0].revenue,
                    backgroundColor: "#1f78b4",
                    borderColor: "#1f78b4",
                    borderWidth: 1
                },
                {
                    label: `${this.calender.getYear() - 1} Revenue`,
                    data: this.log[1].revenue,
                    backgroundColor: "#ff7f00",
                    borderColor: "#ff7f00",
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                }
            }
        });
    }

    _renderPastYearChart(pastYearCharts) {
        let color = COLORS[pastYearCharts.colorCount++];
        let pastYearRevenue = this._getPastYearRevenue();
        let pastYearSales = this._getPastYearSales();
        let revenueDataset = {
          label: this.name,
          data: pastYearRevenue,
          fill: -1,
          borderColor: color,
          backgroundColor: color,
          borderWidth: 2,
          pointBackgroundColor: color,
          lineTension: 0
        }
        let salesDataset = {
          label: this.name,
          data: pastYearSales,
          borderColor: color,
          backgroundColor: color,
          borderWidth: 1,
        }
        pastYearCharts.pastYearRevenueChart.data.datasets.push(revenueDataset);
        pastYearCharts.pastYearSalesChart.data.datasets.push(salesDataset);
        let pastYearRevenueOverall = pastYearCharts.pastYearRevenueChart.data.datasets[0].data;
        for (let i = 0; i < 12; i++) {
          if (pastYearRevenue[i]) {
            pastYearRevenueOverall[i] += pastYearRevenue[i];
            pastYearRevenueOverall[i] = Math.round(pastYearRevenueOverall[i] * 100) / 100;
          }
        }
        pastYearCharts.pastYearRevenueChart.update();
        pastYearCharts.pastYearSalesChart.update();
      }

}