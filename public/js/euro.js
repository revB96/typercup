function selectGroup(){
   getGroup($('#selectGroup option:selected').text())
        .then(result =>{
            printGroupTable(result, 1)
            printSchedule($('#selectGroup option:selected').text())
        }) 
}

function printSchedule(group){
    $('#euro2021-schedule').html("")
    const dateOptions = { year: 'numeric', month: 'numeric', day: 'numeric' };
    var schedule,day
    getGroupSchedule(group)
        .then(result =>{
            var matchByDate = result.reduce((acc, value) => {
                var date = new Date(value.matchDate)
                var formatDate = date.toLocaleDateString('en-GB', dateOptions)
                if (!acc[formatDate]) {
                  acc[formatDate] = [];
                }
                // Grouping
                acc[formatDate].push(value);

                return acc;
              }, {})

              var matchByDateKeys = Object.keys(matchByDate);

              matchByDateKeys.forEach(day => {
                  var matchInDay = matchByDate[day]                
                  day = `<ul class="list-group list-group-flush" style="text-align: center;"><li class="list-group-item list-group-item-primary" aria-current="true">${day}</li></ul>`
                  matchInDay.forEach(match =>{
                    var date = new Date(match.matchDate)
                    if(date.getHours() == "15")
                        day +=`<ul class="list-group list-group-horizontal list-group-flush"><li class="list-group-item list-group-item-action" style="text-align: right;">${match.t1.teamName}</li><li class="list-group-item list-group-item-action" style="text-align: center; max-width: 150px"> <span class="flag-icon flag-icon-${match.t1.shortcut.toLowerCase()}"></span> <i>15:00</i> <span class="flag-icon flag-icon-${match.t2.shortcut.toLowerCase()}"></span></li><li class="list-group-item list-group-item-action"> ${match.t2.teamName}</li></ul>`
                    else if(date.getHours() == "18")
                        day +=`<ul class="list-group list-group-horizontal list-group-flush"><li class="list-group-item list-group-item-action" style="text-align: right;">${match.t1.teamName}</li><li class="list-group-item list-group-item-action" style="text-align: center; max-width: 150px"> <span class="flag-icon flag-icon-${match.t1.shortcut.toLowerCase()}"></span> <i>18:00</i> <span class="flag-icon flag-icon-${match.t2.shortcut.toLowerCase()}"></span></li><li class="list-group-item list-group-item-action"> ${match.t2.teamName}</li></ul>`
                    else if(date.getHours() == "21")
                        day +=`<ul class="list-group list-group-horizontal list-group-flush"><li class="list-group-item list-group-item-action" style="text-align: right;">${match.t1.teamName}</li><li class="list-group-item list-group-item-action" style="text-align: center; max-width: 150px"> <span class="flag-icon flag-icon-${match.t1.shortcut.toLowerCase()}"></span> <i>21:00</i> <span class="flag-icon flag-icon-${match.t2.shortcut.toLowerCase()}"></span></li><li class="list-group-item list-group-item-action"> ${match.t2.teamName}</li></ul>`
                  })
    
                  $('#euro2021-schedule').append(day) 
              });
        })
}

function printGroupTable(result, reload = 0)
{
    var tableBody = "<tbody>"

    if (reload == 1) $('#group-table-body').html("")

    for (const [index,team] of Object.entries(result)) {
        var counter = parseInt(index, 10);
        
        $("#group-table-body").append( `
        <tr>
            <th scope="row">${counter + 1}</th>
            <td>${team.teamName}</td>
            <td><b>${team.played}</b></td>
            <td>${team.won}</td>
            <td>${team.drawn}</td>
            <td>${team.lost}</td>
            <td>${team.for}</td>
            <td>${team.against}</td>
            <td>${team.difference}</td>
            <td>${team.points}</td>
        </tr>
        `)
    }
    //tableBody += "</tbody>"
   // $("#group-table-teams").append(tableBody)

}

$(document).ready(function () {
    //printSchedule("A")
    selectGroup()
})

