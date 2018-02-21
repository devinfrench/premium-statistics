(function () {

  const COLORS = [
    "#33a02c", "#1f78b4", "#e31a1c", "#ff7f00", "#6a3d9a", "#a6cee3",
    "#fb9a99", "#fdbf6f", "#cab2d6", "#b2df8a", "#ffff99"
  ];
  let colorCount;
  let pastYearRevenueChart;
  let pastYearSalesChart;
  let pastYearRevenueOverall;
  let calender;

  init();

  function init() {
    let $sideNav = $("nav.nav-primary > ul > li:nth-child(3) > ul");
    $sideNav.append(`
    <li>
      <a id="premium-statistics" style="cursor: pointer;">
        <i class="fa fa-angle-right"></i><span>Premium Statistics</span>
      </a>
    </li>
    `);
    $("#premium-statistics").on("click", render);
  }

  function render() {
    calender = new Calender();
    let $content = $("#content");
    $content.load(chrome.runtime.getURL("templates/panels.html"), () => {
      let $statsModule = $("#statistics-module");
      let template = $statsModule.find("#statistics-template").html();
      let view = {
        currentYear: calender.getYear(),
        currentMonth: Calender.getMonthName(calender.getMonth()),
        previousMonth: function () {
          return function (months, render) {
            return Calender.getMonthName(calender.getMonth(render(months)));
          }
        },
        previousYear: function () {
          return function (months, render) {
            return calender.getYear(render(months));
          }
        }
      }
      $statsModule.html(Mustache.render(template, view));
      $statsModule.find("#script-tables-module").load(chrome.runtime.getURL("templates/table.html"));
      $statsModule.find("#script-charts-module").load(chrome.runtime.getURL("templates/chart.html"));
      renderPastYearCharts();
      renderPurchaseLogs();
    })
  }

  function renderPastYearCharts() {
    colorCount = 1;
    pastYearRevenueOverall = new Array(12).fill(0);
    let pastYearMonthNamesAbbrev = calender.getPreviousTwelveMonths().monthNamesAbbrev;
    pastYearRevenueChart = new Chart("twelve-months-revenue-chart", {
      type: "line",
      data: {
        labels: pastYearMonthNamesAbbrev,
        datasets: [{
          type: "line",
          label: "Overall",
          data: pastYearRevenueOverall,
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
              beginAtZero: true
            }
          }]
        }
      }
    });
    pastYearSalesChart = new Chart("twelve-months-sales-chart", {
      type: "bar",
      data: {
        labels: pastYearMonthNamesAbbrev
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

  function renderPurchaseLogs() {
    $.get("https://tribot.org/repository/data/scripter_panel/published_scripts")
      .done(function (data) {
        $.each($.parseJSON(data).aaData, function (key, value) {
          if (value.actions.includes("Purchase Logs")) {
            $.get(`https://tribot.org/repository/index.php/data/scripter_panel/purchase_logs/${value.id}/`)
              .done(function (data) {
                let logs = $.parseJSON(data).aaData;
                if (logs.length > 2) {
                  let purchaseLog = new PurchaseLog(value.name, logs, calender);
                  purchaseLog.render();
                  renderTwelveMonthChart(purchaseLog);
                }
              });
          }
        });
      });
  }

  function renderTwelveMonthChart(purchaseLog) {
    let color = COLORS[colorCount++];
    let pastYearRevenue = purchaseLog.getPastYearRevenue();
    let pastYearSales = purchaseLog.getPastYearSales();
    let revenueDataset = {
      label: purchaseLog.name,
      data: pastYearRevenue,
      fill: -1,
      borderColor: color,
      backgroundColor: color,
      borderWidth: 2,
      pointBackgroundColor: color,
      lineTension: 0
    }
    let salesDataset = {
      label: purchaseLog.name,
      data: pastYearSales,
      borderColor: color,
      backgroundColor: color,
      borderWidth: 1,
    }
    pastYearRevenueChart.data.datasets.push(revenueDataset);
    pastYearSalesChart.data.datasets.push(salesDataset);
    for (let i = 0; i < 12; i++) {
      if (pastYearRevenue[i]) {
        pastYearRevenueOverall[i] += pastYearRevenue[i];
        pastYearRevenueOverall[i] = Math.round(pastYearRevenueOverall[i] * 100) / 100;
      }
    }
    pastYearRevenueChart.update();
    pastYearSalesChart.update();
  }

})();