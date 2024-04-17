function printLastRoundNav(round) {
  $("#last-round-nav").html(`<div class="d-flex justify-content-center">
    <div class="spinner-border" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
  </div>`)
  getRoundByStage(round).then((roundDetails) => {
    getCountFinishedRound().then((count) => {
      $("#last-round-nav").html("")
      var dropdownItems = "";
      
      if(count > 0){
        for (let i = 1; i <= count; i++) {
          dropdownItems +=`<a class="dropdown-item" href="/previousRound?round=${i}">Kolejka #${i}</a>`;
        }
      
        $("#last-round-nav").html(`
                  <div class="dropdown">
                      <button class="btn btn-primary dropdown-toggle btn-lg" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                      Kolejka ${round}
                      </button>
                      <ul class="dropdown-menu">
                          ${dropdownItems}
                      </ul>
                  </div>
                  `);
      }else{
        $("#last-round-nav").html(`<p>Brak rozegranych kolejek</p>`)
      }
     
      if (roundDetails.state == "running" || roundDetails.state == "unstarted")
        $(`#last-round-accordion`).append("Kolejka jeszcze się nie zakończyła");
      else printLastRoundTickers(round);
    });
  });
}

function printLastRoundTickers(round) {
  $(`#last-round-accordion`).html(`<div class="d-flex justify-content-center">
    <div class="spinner-border" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
  </div>`);
  getRoundTickets(round).then((tickets) => {
    var ticketsByMatch = tickets.reduce((acc, value) => {
      if (!acc[value.schedule._id]) {
        acc[value.schedule._id] = [];
      }
      // Grouping
      acc[value.schedule._id].push(value);

      return acc;
    }, {});

    var ticketsByDateKeys = Object.keys(ticketsByMatch);
    $(`#last-round-accordion`).html("")
    ticketsByDateKeys.forEach((match) => {
      var matchCounter = 0;
      getScheduleScore(ticketsByMatch[match][0].schedule._id).then((score) => {
        if(!!score){
        matchCounter++;
        var scoreResult = "vs";
        if (score.schedule._id == match)
          scoreResult = `${score.t1g}:${score.t2g}`;

        var matchAccordion = `
            <div class="accordion-item">
                <h2 style="text-align: center" class="accordion-header" id="flush-heading-${
                  ticketsByMatch[match][0]._id
                }">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#flush-collapse-${
                  ticketsByMatch[match][0]._id
                }" aria-expanded="false" aria-controls="flush-collapse-${
          ticketsByMatch[match][0]._id
        }">
                    ${
                      ticketsByMatch[match][0].schedule.t1.teamName
                    } <span class="flag-icon ml-1 mr-1 flag-icon-${ticketsByMatch[
          match
        ][0].schedule.t1.shortcut.toLowerCase()}"></span> ${scoreResult} <span class="flag-icon ml-1 mr-1 flag-icon-${ticketsByMatch[
          match
        ][0].schedule.t2.shortcut.toLowerCase()}"></span> ${
          ticketsByMatch[match][0].schedule.t2.teamName
        }
                </button>
                </h2>
                <div id="flush-collapse-${
                  ticketsByMatch[match][0]._id
                }" class="accordion-collapse collapse" aria-labelledby="flush-heading-${
          ticketsByMatch[match][0]._id
        }" data-bs-parent="#last-round-accordion">
                <div class="accordion-body">
                    <div class="table-responsive">
                        <table class="table table-striped table-sm" style="text-align: center;">
                        <thead class="table-dark">
                            <tr>
                            <th scope="col">#</th>
                            <th scope="col">Nick</th>
                            <th scope="col">Typ</th>
                            <th scope="col">Punkty</th>
                            </tr>
                        </thead>
                        <tbody>
            `;
        var counter = 1;

        ticketsByMatch[match].forEach((userTicket) => {
          var trClass = "",
            result = "";
          if ((score.t1g == userTicket.t1g) & (score.t2g == userTicket.t2g)) {
            trClass = "table-success";
            result = "+3";
          } else if (
            (score.t1g != userTicket.t1g || score.t2g != userTicket.t2g) &
            ((score.t1g == score.t2g) & (userTicket.t1g == userTicket.t2g) ||
              (score.t1g > score.t2g) & (userTicket.t1g > userTicket.t2g) ||
              (score.t1g < score.t2g) & (userTicket.t1g < userTicket.t2g))
          ) {
            result = "+1.5";
            trClass = "table-info";
          } else {
            result = "0";
            trClass = "table-danger";
          }

          matchAccordion += `
                <tr class="${trClass}">
                    <th scope="row">${counter}</th>
                    <th>${userTicket.user.username}</th>
                    <td>${userTicket.t1g}:${userTicket.t2g}</td>
                    <td>${result}</td>
                </tr>
                `;
          counter++;
        });
        matchAccordion += `
                            </tbody>
                        </table>
                    </div>
                </div>
                </div>
            </div>
            `;
        $(`#last-round-accordion`).append(matchAccordion);
      }
      });
    });
  });
}

function getQueryParams(qs) {
  qs = qs.split("+").join(" ");

  var params = {},
    tokens,
    re = /[?&]?([^=]+)=([^&]*)/g;

  while ((tokens = re.exec(qs))) {
    params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
  }

  return params;
}

$(document).ready(function () {
  if (window.location.pathname === '/previousRound') {
    var query = getQueryParams(document.location.search);
    console.log(query);
    printLastRoundNav(query.round);
  }
});
