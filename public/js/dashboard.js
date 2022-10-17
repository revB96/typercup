function printRoundWithMatches(round) {
  const dateOptions = { year: "numeric", month: "numeric", day: "numeric" };
  if(round == 0){
    var roundState = "Disabled";
  }else{
    var roundState = "";
  }

  getRound("running").then((round) => {
      $(`#dashboard-round-matches`).html("");
      getRoundSchedule(round[0].roundDate).then((schedule) => {
        getUserTickets(getUserId(), round[0].round).then((userTickets) => {
          getUserTimezone(getUserId()).then((userTimezone) => {
          
          var roundDate = new Date(round[0].roundDate);
          var closeTime = new Date(schedule[0].matchDate)
          var timeoffset;

          if (userTimezone.timezone == "UK")
            timeoffset = 2
          else
            timeoffset = 1;

          //console.log(closeTime.getHours());  
          //console.log(userTimezone);

          if(roundState != "disabled")  
            $(`#dashboard-round-display-name`).html(`${round[0].displayName}`);
          else $(`#dashboard-round-display-name`).html(`<div class="row" style="text-align: center;"><h3>Kolejka zamknięta</h3></div>`);
          
          var minutes = closeTime.getMinutes()
      
          if (minutes < 10)
            minutes = "00"
          if(roundState != "Disabled")
            $(`#dashboard-round-date`).html(
              `${roundDate.toLocaleDateString("pl-PL", dateOptions)}<br /> Godzina zamknięcia kolejki: ${closeTime.getHours()-timeoffset}:${minutes}`
            );
          else{
            $(`#dashboard-round-date`).html(
              `${roundDate.toLocaleDateString("pl-PL", dateOptions)}<br /> Kolejka została zamknięta o: ${closeTime.getHours()-timeoffset}:${minutes}`
            );
            $(`#dashboard-message`).html(`<a href="/roundSummary"><button type="button" class="btn btn-primary">Sprawdź jak postawili inni</button></a>`);
          }

          for (const [index, match] of Object.entries(schedule)) {
            
            getTicketsStats(match._id).then(stats => {
              var t1g = "",
                t2g = "",
                t1w = 0,
                t2w = 0,
                drawn = 0,
                ticketColor = "text-white bg-danger";

              t1w = stats.t1;
              t2w = stats.t2;
              drawn = stats.drawn;
            
            for (const [index, userTicket] of Object.entries(userTickets)) {
              if (match._id == userTicket.schedule) {
                if ((userTicket.t1g != null) & (userTicket.t2g != null)) {
                  t1g = userTicket.t1g;
                  t2g = userTicket.t2g;
                  ticketColor = "text-white bg-success";
                }
              }
            }

            var timeMatch = new Date(match.matchDate);
            var hrs = timeMatch.getHours();
            if (userTimezone.timezone == "UK")
              hrs = hrs - 1;

            var mins = timeMatch.getMinutes();
            if (hrs <= 9) hrs = "0" + hrs;
            if (mins < 10) mins = "0" + mins;

            console.log("t2: " + stats.t2)
            console.log("t1: " +stats.t1)
            console.log("drawn: " +stats.drawn)

            $(`#dashboard-round-matches`).append(`
                        <div class="col" style="margin-right: 0;">
                            <div class="card ${ticketColor}">
                            <div class="card-body">
                                <p class="card-text"><small>${hrs}:${mins}</small></p>
                                <h5 class="card-title" style="text-align: center;">
                                <div class="row">
                                    <div class="col">
                                    <b>${match.t1.teamName}</b>
                                    </div>
                                    <div class="col-2">
                                    </div>
                                    <div class="col">
                                    <b>${match.t2.teamName}</b>
                                    </div>
                                </div>
                                </h5>
                                <p class="card-text">
                                  <div class="row">
                                      <input type="text" class="form-control d-none" value="${match._id}" disabled/>
                                      <input type="text" class="form-control d-none" value="${round[0].round}" disabled/>
                                      <div class="col">
                                        <input type="text" value="${t1g}" class="form-control" style="text-align: center;" name="${match.t1._id}" ${roundState}>
                                      </div>
                                      <div class="col-1">:
                                      </div>
                                      <div class="col">
                                        <input type="text" value="${t2g}" class="form-control" style="text-align: center;" name="${match.t2._id}" ${roundState}>
                                      </div>
                                  </div>
                                  <div class="row">
                                    <div class="progress">
                                      <div class="progress-bar progress-bar-striped" role="progressbar" style="width: 10%" aria-valuenow="10" aria-valuemin="0" aria-valuemax="100"></div>
                                    </div>
                                  </div>
                                </p>
                                <p class="card-text"><small>Grupa ${match.group}</small></p>
                            </div> 
                        </div>
                        `);
           })
          }
        });
      });
      });
    });
    if (roundState == "")
      $("#dashboard-submit-button")
        .html(`<div class="d-grid gap-2" style="padding: 1.5em;">
                <button type="submit" class="btn btn-primary">Dodaj</button>
               </div>`);
        
}

$(document).ready(function () {
  $(`#dashboard-round-matches`).html("Brak aktywnych kolejek");
  if(document.title == "Typer Cup | Dashboard"){
  checkIfRoundIsOpen(getUserId()).then((roundState) => {
     if (roundState == true)
       printRoundWithMatches(1);
     else{
       printRoundWithMatches(0);
     }
   })
  $("#add-ticket-form").submit(function (e) {
    e.preventDefault();
    var inputs = document.getElementsByTagName("input");
    var lenght = inputs.length;
    //console.log(inputs)
    var tickets = `[`;
    for (var i = 0; i < lenght; i += 4) {
      tickets += JSON.stringify({
        scheduleId: inputs[i].value,
        round: inputs[i + 1].value,
        t1g: inputs[i + 2].value,
        t2g: inputs[i + 3].value,
        userId: getUserId(),
      });
      if (i != lenght - 4) tickets += ",";
    }
    tickets += `]`;
    $.ajax({
      url: "/api/ticket/add",
      type: "POST",
      data: tickets,
      contentType: "application/json",
      success: () => {
        $(".toast").html(`
                    <div class="toast-header">
                    <strong class="mr-auto">Typer Cup</strong>
                    <button type="button" class="ml-2 mb-1 close" data-dismiss="toast" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                    </div>
                    <div class="toast-body">
                        Zapisano twoje typy
                    </div>
                `);
        $(".toast").toast("show");
        printRoundWithMatches();
      },
      error: (xhr, status, error)=>{
        $(".toast").html(`
            <div class="toast-header">
            <strong class="mr-auto">Typer Cup</strong>
            <button type="button" class="ml-2 mb-1 close" data-dismiss="toast" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>
            </div>
            <div class="toast-body">
              ${xhr.responseJSON}
            </div>
            `);
      $(".toast").toast("show");
      }
    });
  });
  }
});
