function printRoundWithMatches(round) {
  const dateOptions = { year: "numeric", month: "numeric", day: "numeric" };
  if (round == 0) {
    var roundState = "Disabled";
  } else {
    var roundState = "";
  }

  getRound("running").then((round) => {
    $(`#dashboard-round-matches`).html(`<div class="spinner-border" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>`);
    getRoundSchedule(round[0].roundDate).then(async (schedule) => {
      await getUserTickets(getUserId(), round[0].round).then(async (userTickets) => {
        await getUserTimezone(getUserId()).then(async (userTimezone) => {
          $(`#dashboard-round-matches`).html("")
          var roundDate = new Date(round[0].roundDate);
          var closeTime = new Date(schedule[0].matchDate);
          var timeoffset;
          var spinner = `<button class="btn btn-sm btn-light" type="button" disabled>
                          <span class="spinner-grow spinner-grow-sm text-success" role="status" aria-hidden="true"></span>
                          <span class="visually-hidden">Loading...</span>
                        </button>`
  
          if (userTimezone.timezone == "UK") timeoffset = 1;
          else timeoffset = 0;

          //console.log(closeTime.getHours());
          //console.log(userTimezone);

          if (roundState != "disabled"){
            $(`#dashboard-round-display-name`).html(`${round[0].displayName}`);
          }else{
            $(`#dashboard-round-display-name`).html(
              `<div class="row" style="text-align: center;"><h3>Kolejka zamknięta</h3></div>`
            );
          }
        
          var minutes = closeTime.getMinutes();
          var today = new Date();
          console.log(today.getHours())
          console.log(today.getHours() - closeTime.getHours())
          if((closeTime.getMonth() == today.getMonth())&(closeTime.getDate() == today.getDate())&(closeTime.getHours() - today.getHours() == 2))
            spinner = `<button class="btn btn-sm btn-light" type="button" disabled>
                        <span class="spinner-grow spinner-grow-sm text-warning" role="status" aria-hidden="true"></span>
                        <span class="visually-hidden">Loading...</span>
                       </button>`

          if (minutes < 10) minutes = "00";
          if (roundState != "Disabled")
            $(`#dashboard-round-date`).html(
              `${roundDate.toLocaleDateString(
                "pl-PL",
                dateOptions
              )}<br /> Godzina zamknięcia kolejki: ${closeTime.getHours() - 1}:${minutes} ${spinner}`
            );
          else {
            spinner = `<button class="btn btn-sm btn-light" type="button" disabled>
                          <span class="spinner-grow spinner-grow-sm text-danger" role="status" aria-hidden="true"></span>
                          <span class="visually-hidden">Loading...</span>
                        </button>`
            $(`#dashboard-round-date`).html(
              `${roundDate.toLocaleDateString(
                "pl-PL",
                dateOptions
              )}<br /> Kolejka została zamknięta o: ${closeTime.getHours() - 1}:${minutes} ${spinner}`
            );

            $(`#dashboard-message`).html(
              `<a href="/roundSummary"><button type="button" class="btn btn-primary">Sprawdź jak postawili inni</button></a>`
            );
          }

          for await (const [index, match] of Object.entries(schedule)) {
            await getTicketsStats(match._id).then(async (stats) => {
              var t1g = "",
                  t2g = "",
                  statsDiv = "",
                  ticketColor = "text-white bg-danger";
            
              if (stats.counter > 2) {
                statsDiv = `<div class="row" style="margin-top: 20px;"><div class="progress" style="background: none; height: 20px;">`;
                if (stats.t1>0) statsDiv += `<div class="progress-bar-striped progress-bar-animated bg-primary" role="progressbar" style="width: ${stats.t1}%" aria-valuenow="${stats.t1}" aria-valuemin="0" aria-valuemax="100"><span class="mt-1 flag-icon flag-icon-${match.t1.shortcut.toLowerCase()}"></div>`;
                if (stats.drawn>0)  statsDiv += `<div class="progress-bar-striped progress-bar-animated bg-warning" role="progressbar" style="width: ${stats.drawn}%" aria-valuenow="${stats.drawn}" aria-valuemin="0" aria-valuemax="100"><img style="width:20px; height: 20px;" src="img/handshake.png" /></div>`;
                if (stats.t2>0) statsDiv += `<div class="progress-bar-striped progress-bar-animated bg-info" role="progressbar" style="width: ${stats.t2}%" aria-valuenow="${stats.t2}" aria-valuemin="0" aria-valuemax="100"><span class="mt-1 flag-icon flag-icon-${match.t2.shortcut.toLowerCase()}"></div>`
                statsDiv += `</div><small>Liczba oddanych typów: ${stats.counter}</small>`;
              } else {
                statsDiv = `</div><p class="fw-lighter" style="color: white; margin: 0; padding: 0;">(Zbyt mało głosów)</div>`;
              }

              for await (const [index, userTicket] of Object.entries(userTickets)) {
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
              var mins = timeMatch.getMinutes();
         

              if (hrs <= 9) hrs = "0" + hrs;
              if (mins < 10) mins = "0" + mins;

              var group = `<b>Grupa ${match.group}</b><br />`

              await $(`#dashboard-round-matches`).append(`
                  <div class="col" style="margin-right: 0;">
                  <div class="card ${ticketColor}">
                      <div class="card-body">
                          <p class="card-text">
                            ${group}
                            <small>${hrs - timeoffset}:${mins}</small>
                          </p>
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
                                  <input id="${match.t1._id}" onchange="verifyValue('${match.t1._id}','${roundState}')" type="number" value="${t1g}" class="form-control" min="0" max="9" style="text-align: center;" name="${match.t1._id}" ${roundState} required>
                              </div>
                              <div class="col-1">:
                              </div>
                              <div class="col">
                                  <input id="${match.t2._id}" onchange="verifyValue('${match.t2._id}','${roundState}')" type="number" value="${t2g}" class="form-control" min="0" max="9" style="text-align: center;" name="${match.t2._id}" ${roundState} required>
                              </div>
                          </div>
                          ${statsDiv}
                      </div>
                  </div> 
              </div>
            `);
            });
          }
        });
      });
    });
  });
  if (roundState == "")
    $("#dashboard-submit-button")
      .html(`<div class="d-grid gap-2" style="padding: 1.5em;">
                <button id="sendTicketsButton" type="submit" class="btn btn-primary">Dodaj</button>
               </div>`);
}

function verifyValue(inputId, roundState){
  var buttonState1 = 0;
  var buttonState2 = 0;

  if($(`#${inputId}`).val() == null){
    $(`#dashboard-warnings-nullType`).html("<em><small>Nie wypełniłeś wszystkich typów</small></em>")
    buttonState1 = 0;
  }else{
    $(`#dashboard-warnings-nullType`).html("")
    buttonState1 = 1;
  }

  if($(`#${inputId}`).val() > 9){
    $(`#dashboard-warnings-invalidType`).html("<em><small>Jeden z wyników w twoich typach, jest większy niż 9!</small></em>")
    buttonState2 = 0
  }else{
    $(`#dashboard-warnings-invalidType`).html("")
    buttonState2 = 1;
  }

  if((buttonState1 == 1) & (buttonState2 == 1)){
    $(`#${inputId}`).addClass("is-valid")
    $(`#${inputId}`).removeClass("is-invalid")
    if(roundState==""){
      $(`#sendTicketsButton`).removeClass("disabled")
    }
  }else{
    $(`#${inputId}`).removeClass("is-valid")
    $(`#${inputId}`).addClass("is-invalid")
    if(roundState==""){
      $(`#sendTicketsButton`).addClass("disabled")
    }
  }

}

$(document).ready(function () {
  $(`#dashboard-round-matches`).html("Brak aktywnych kolejek");
  if (document.title == "Typer Cup | Dashboard") {
    checkIfRoundIsOpen(getUserId()).then((roundState) => {
      if (roundState == true) printRoundWithMatches(1);
      else printRoundWithMatches(0);
      
    });
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
        error: (xhr, status, error) => {
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
        },
      });
    });
  }
});
