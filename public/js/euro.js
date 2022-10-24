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

function selectKnockout(){
    $('#euro2021-knockout').html("")
    getKnockoutSchedule($('#selectKnockout option:selected').val())
         .then(result =>{
             if(!!result) printKnockoutSchedule(result)
         }) 
 }

function printKnockoutSchedule(knockoutState){
    const dateOptions = { year: 'numeric', month: 'numeric', day: 'numeric' };

            var matchByDate = knockoutState.reduce((acc, value) => {
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
    
                  $('#euro2021-knockout').append(day) 
              });

}

function printGroupTable(result, reload = 0){

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
    
}

function print18schedule() {
  get18Schedule().then(async (schedule) => {
    var counter = 0;
    for await (const [index, match] of Object.entries(schedule)) {
        counter++;
      const dateOptions = { year: "numeric", month: "numeric", day: "numeric" };
      var date = new Date(match.matchDate);
      var formatDate = date.toLocaleDateString("en-GB", dateOptions);
      var hrs = date.getHours();
      var mins = date.getMinutes();
      
      if (hrs <= 9) hrs = "0" + hrs;
      if (mins < 10) mins = "0" + mins;

      $("#18-stage-table").append(`
                <div class="col">
                    <div class="card text-white bg-primary mb-3">
                        <div class="card-header">${formatDate}</div>
                        <div class="card-body">
                            <div class="row">
                                <div class="col" style="text-align:center">
                                    <b>${match.t1.teamName}</b>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col" style="text-align:center">
                                    <span class="flag-icon flag-icon-${match.t1.shortcut.toLowerCase()}"></span><small>${hrs}:${mins}</small><span class="flag-icon flag-icon-${match.t2.shortcut.toLowerCase()}"></span>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col" style="text-align:center">
                                    <b>${match.t2.teamName}</b>
                                </div>
                            </div>
                        </div>
                        </div>
                    </div>
                </div>
            `);
    }

    if (counter < 8) {
      for (let i = counter; i <= 7; i++) {
        $("#18-stage-table").append(`
                <div class="col">
                    <div class="card text-white bg-primary mb-3">
                        <div class="card-header">??:??</div>
                        <div class="card-body">
                        <div class="row">
                            <div class="col">
                            <b>??</b>
                            </div>
                            <div class="col-2">
                            </div>
                            <div class="col">
                            <b>??</b>
                            </div>
                        </div>
                        </div>
                    </div>
                </div>
            `);
      }
    }
  });
}

$(document).ready(function () {
    if(document.title == "Typer Cup | Euro 2021"){
        selectGroup()
        print18schedule()
    }
})

