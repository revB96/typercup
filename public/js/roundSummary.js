function printRoundSummaryAccordion(){
  $(`#round-summary-accordion`).html(`<div class="d-flex justify-content-center">
      <div class="spinner-border" role="status">
      <span class="visually-hidden">Loading...</span>
      </div>
  </div>`)
          getRound("running").then((runningRound) => {
              getRoundTickets(runningRound[0].round).then(tickets =>{
                var matchAccordion = ""
                var ticketsLenght = 0;
                  var ticketsByMatch = tickets.reduce((acc, value) => {
                      if (!acc[value.schedule._id]) {
                        acc[value.schedule._id] = [];
                      }
                      // Grouping
                      acc[value.schedule._id].push(value);
      
                      return acc;
                    }, {})

                    var ticketsByDateKeys = Object.keys(ticketsByMatch);
                    $(`#round-summary-accordion`).html("")
                    ticketsByDateKeys.forEach(match => {
                      var diff = Math.abs(new Date() - new Date(ticketsByMatch[match][0].schedule.matchDate));
                      if (new Date() >new Date(ticketsByMatch[match][0].schedule.matchDate) || diff < 300000) {
                        ticketsLenght++;
                        var matchAccordion =`
                        <div class="accordion-item">
                            <h2 style="text-align: center" class="accordion-header" id="flush-heading-${ticketsByMatch[match][0]._id}">
                            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#flush-collapse-${ticketsByMatch[match][0]._id}" aria-expanded="false" aria-controls="flush-collapse-${ticketsByMatch[match][0]._id}">
                                ${ticketsByMatch[match][0].schedule.t1.teamName} <span class="flag-icon ml-1 mr-1 flag-icon-${ticketsByMatch[match][0].schedule.t1.shortcut.toLowerCase()}"></span> vs <span class="flag-icon ml-1 mr-1 flag-icon-${ticketsByMatch[match][0].schedule.t2.shortcut.toLowerCase()}"></span> ${ticketsByMatch[match][0].schedule.t2.teamName}
                            </button>
                            </h2>
                            <div id="flush-collapse-${ticketsByMatch[match][0]._id}" class="accordion-collapse collapse" aria-labelledby="flush-heading-${ticketsByMatch[match][0]._id}" data-bs-parent="#round-summary-accordion">
                            <div class="accordion-body">
                                <div class="table-responsive">
                                    <table class="table table-sm" style="text-align: center;">
                                    <thead class="table-dark">
                                        <tr>
                                        <th scope="col">#</th>
                                        <th scope="col">Nick</th>
                                        <th scope="col">${ticketsByMatch[match][0].schedule.t1.teamName}</th>
                                        <th scope="col">${ticketsByMatch[match][0].schedule.t2.teamName}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                        `
                        var counter = 1
                        ticketsByMatch[match].forEach(userTicket => {
                            var nickname = userTicket.user.username;
                            var textSize="";
                            
                            if(nickname.length > 12)
                                textSize="font-size:11px;"
                            
                            matchAccordion += `
                            <tr>
                                <th scope="row">${counter}</th>
                                <td>
                                    <button style="border-style: none; background-color: transparent; ${textSize}" id="roundSummaryButton-${userTicket._id}">${userTicket.user.username}</button>
                                    <script>tippy('#roundSummaryButton-${userTicket._id}', {
                                        content: "${userTicket.user.friendlyName}",
                                        placement: 'right-start',
                                        theme: 'material',
                                    });
                                    </script>
                                </td>
                                <td>${userTicket.t1g}</td>
                                <td>${userTicket.t2g}</td>
                            </tr>
                            `
                            counter ++
                        })
                        matchAccordion += `
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            </div>
                        </div>
                        `
                        if (ticketsLenght == 0){
                            $(`#round-summary-accordion`).append('<div class="alert alert-warning d-flex align-items-center" role="alert"><svg class="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Warning:"><use xlink:href="#exclamation-triangle-fill"/></svg><div>Wszystkie mecze są otwarte i trwa obstawianie. Wróć tutaj jak zakończy się obstawienie na pierwszy mecz.</div></div>')
                        }
                        $(`#round-summary-accordion`).append(matchAccordion)

                    }
                    })
              })
          })
}

$(document).ready(function () {
    if (window.location.pathname === '/roundSummary') {
      printRoundSummaryAccordion()
  }
})