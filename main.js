(function () {

  let pastYearCharts = {
    colorCount: 1,
    pastYearRevenueChart: undefined,
    pastYearSalesChart: undefined
  }
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
    $content.load(chrome.runtime.getURL("templates/panels.html"), function () {
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
    pastYearCharts.colorCount = 1;
    let pastYearMonthNamesAbbrev = calender.getPreviousTwelveMonths().monthNamesAbbrev;
    pastYearCharts.pastYearRevenueChart = new Chart("twelve-months-revenue-chart", {
      type: "line",
      data: {
        labels: pastYearMonthNamesAbbrev,
        datasets: [{
          type: "line",
          label: "Overall",
          data: new Array(12).fill(0),
          fill: -1,
          borderColor: "#33a02c",
          backgroundColor: "#33a02c",
          borderWidth: 2,
          pointBackgroundColor: "#33a02c",
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
    pastYearCharts.pastYearSalesChart = new Chart("twelve-months-sales-chart", {
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
    $.get("https://repo.tribot.org/data/scripter_panel/published_scripts")
      .done(function (data) {
        $.each($.parseJSON(data).aaData, function (key, value) {
          if (value.actions.includes("Purchase Logs")) {
            $.get(`https://repo.tribot.org/index.php/data/scripter_panel/purchase_logs/${value.id}/`)
              .done(function (data) {
                let logs = $.parseJSON(data).aaData;
                if (logs.length > 2) {
                  let purchaseLog = new PurchaseLog(value.name, logs, calender);
                  purchaseLog.render(pastYearCharts);
                }
              });
          }
        });
      });
  }

})();