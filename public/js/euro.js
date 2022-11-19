function selectGroup() {
  getGroup($("#selectGroup option:selected").text()).then((result) => {
    printGroupTable(result, 1);
    printSchedule($("#selectGroup option:selected").text());
  });
}

function printSchedule(group) {
  $("#euro2021-schedule").html(`<div class="d-flex justify-content-center">
    <div class="spinner-border" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
  </div>`);
  const dateOptions = { year: "numeric", month: "numeric", day: "numeric" };
  getGroupSchedule(group).then((result) => {
    getUserTimezone(getUserId()).then(async (userTimezone) => {
      $("#euro2021-schedule").html("")
      var matchByDate = result.reduce((acc, value) => {
        var date = new Date(value.matchDate);
        var formatDate = date.toLocaleDateString("en-GB", dateOptions);
        if (!acc[formatDate]) {
          acc[formatDate] = [];
        }
        // Grouping
        acc[formatDate].push(value);

        return acc;
      }, {});

      var matchByDateKeys = Object.keys(matchByDate);

      matchByDateKeys.forEach(async (day) => {
        var matchInDay = matchByDate[day];
        day = `<ul class="list-group list-group-flush" style="text-align: center;"><li class="list-group-item list-group-item-primary" aria-current="true">${day}</li></ul>`;
        await matchInDay.forEach(async (match) => {
          var date = new Date(match.matchDate);
          var hrs = date.getHours(),
            mins = date.getMinutes();

          if (userTimezone.timezone == "UK") hrs--;
          if (date.getHours() <= 9) hrs = "0" + date.getHours();
          if (date.getMinutes() < 10) mins = "0" + date.getMinutes();

          day += `<ul class="list-group list-group-horizontal list-group-flush"><li class="list-group-item list-group-item-action" style="text-align: right;">${
            match.t1.teamName
          }</li><li class="list-group-item list-group-item-action" style="text-align: center; max-width: 150px"> <span class="flag-icon flag-icon-${match.t1.shortcut.toLowerCase()}"></span> <i>${hrs}:${mins}</i> <span class="flag-icon flag-icon-${match.t2.shortcut.toLowerCase()}"></span></li><li class="list-group-item list-group-item-action"> ${
            match.t2.teamName
          }</li></ul>`;
        });

        await $("#euro2021-schedule").append(day);
      });
    });
  });
}

function printGroupTable(result, reload = 0) {
  if (reload == 1) $("#group-table-body").html("");

  for (const [index, team] of Object.entries(result)) {
    var counter = parseInt(index, 10);
    var promotion = `class="table-light"`

    if(index == 0 )
      promotion = `class="table-success"`
    if(index == 1)
      promotion = `class="table-info"`

    $("#group-table-body").append(`
        <tr ${promotion}>
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
        `);
  }
}

function print18schedule() {
  get18Schedule().then(async (schedule) => {
    getUserTimezone(getUserId()).then(async (userTimezone) => {
      var counter = 0;
      for await (const [index, match] of Object.entries(schedule)) {
        counter++;
        const dateOptions = {
          year: "numeric",
          month: "numeric",
          day: "numeric",
        };
        var date = new Date(match.matchDate);
        var formatDate = date.toLocaleDateString("en-GB", dateOptions);
        var hrs = date.getHours();
        var mins = date.getMinutes();

        if (userTimezone.timezone == "UK") hrs--;
        if (hrs <= 9) hrs = "0" + hrs;
        if (mins < 10) mins = "0" + mins;

        $("#18-stage-table").append(`
               
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
              
            `);
      }

      if (counter < 8) {
        for (let i = counter; i <= 7; i++) {
          $("#18-stage-table").append(`
               
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
               
            `);
        }
      }
    });
  });
}

function print14schedule() {
  get14Schedule().then(async (schedule) => {
    getUserTimezone(getUserId()).then(async (userTimezone) => {
      var counter = 0;
      for await (const [index, match] of Object.entries(schedule)) {
        counter++;
        const dateOptions = {
          year: "numeric",
          month: "numeric",
          day: "numeric",
        };
        var date = new Date(match.matchDate);
        var formatDate = date.toLocaleDateString("en-GB", dateOptions);
        var hrs = date.getHours();
        var mins = date.getMinutes();

        if (userTimezone.timezone == "UK") hrs--;
        if (hrs <= 9) hrs = "0" + hrs;
        if (mins < 10) mins = "0" + mins;

        $("#14-stage-table").append(`
                      <div class="card text-white bg-secondary mb-3">
                          <div class="card-header">${formatDate}</div>
                          <div class="card-body">
                              <div class="row">
                                  <div class="col-4" style="text-align:center">
                                      <b>${match.t1.teamName}</b>
                                  </div>
                                  <div class="col-4" style="text-align:center">
                                      <span class="flag-icon flag-icon-${match.t1.shortcut.toLowerCase()}"></span><small>${hrs}:${mins}</small><span class="flag-icon flag-icon-${match.t2.shortcut.toLowerCase()}"></span>
                                  </div>
                                  <div class="col-4" style="text-align:center">
                                      <b>${match.t2.teamName}</b>
                                  </div>
                              </div>
                          </div>
                          </div>
                      </div>          
              `);
      }

      if (counter < 4) {
        for (let i = counter; i < 4; i++) {
          $("#14-stage-table").append(`
                 
                      <div class="card text-white bg-secondary mb-3">
                          <div class="card-header">??:??</div>
                          <div class="card-body">
                          <div class="row">
                              <div class="col" style="text-align:center">
                              <b>??</b>
                              </div>
                              <div class="col" style="text-align:center">
                              </div>
                              <div class="col" style="text-align:center">
                              <b>??</b>
                              </div>
                          </div>
                          </div>
                      </div>
                
              `);
        }
      }
    });
  });
}

function print12schedule() {
  get12Schedule().then(async (schedule) => {
    getUserTimezone(getUserId()).then(async (userTimezone) => {
      var counter = 0;
      for await (const [index, match] of Object.entries(schedule)) {
        counter++;
        const dateOptions = {
          year: "numeric",
          month: "numeric",
          day: "numeric",
        };
        var date = new Date(match.matchDate);
        var formatDate = date.toLocaleDateString("en-GB", dateOptions);
        var hrs = date.getHours();
        var mins = date.getMinutes();

        if (userTimezone.timezone == "UK") hrs--;
        if (hrs <= 9) hrs = "0" + hrs;
        if (mins < 10) mins = "0" + mins;

        $("#12-stage-table").append(`
        <div class="card text-white bg-success mb-3">
            <div class="card-header">${formatDate}</div>
            <div class="card-body">
                <div class="row">
                    <div class="col-4" style="text-align:center">
                        <b>${match.t1.teamName}</b>
                    </div>
                    <div class="col-4" style="text-align:center">
                        <span class="flag-icon flag-icon-${match.t1.shortcut.toLowerCase()}"></span><small>${hrs}:${mins}</small><span class="flag-icon flag-icon-${match.t2.shortcut.toLowerCase()}"></span>
                    </div>
                    <div class="col-4" style="text-align:center">
                        <b>${match.t2.teamName}</b>
                    </div>
                </div>
            </div>
            </div>
        </div>`);
      }

      if (counter < 2) {
        for (let i = counter; i < 2; i++) {
          $("#12-stage-table").append(`
                 
                      <div class="card text-white bg-success mb-3">
                          <div class="card-header">??:??</div>
                          <div class="card-body">
                          <div class="row">
                              <div class="col" style="text-align:center">
                              <b>??</b>
                              </div>
                              <div class="col" style="text-align:center">
                              </div>
                              <div class="col" style="text-align:center">
                              <b>??</b>
                              </div>
                          </div>
                          </div>
                      </div>
                
              `);
        }
      }
    });
  });
}

function printFinal() {
  getFinalSchedule().then(async (schedule) => {
    getUserTimezone(getUserId()).then(async (userTimezone) => {
      var counter = 0;
      for await (const [index, match] of Object.entries(schedule)) {
        counter++;
        const dateOptions = {
          year: "numeric",
          month: "numeric",
          day: "numeric",
        };
        var date = new Date(match.matchDate);
        var formatDate = date.toLocaleDateString("en-GB", dateOptions);
        var hrs = date.getHours();
        var mins = date.getMinutes();
        if (userTimezone.timezone == "UK") hrs--;
        if (hrs <= 9) hrs = "0" + hrs;
        if (mins < 10) mins = "0" + mins;

        $("#final-stage-table").append(`
                      <div class="card text-white bg-warning mb-3">
                          <div class="card-header">${formatDate}</div>
                          <div class="card-body">
                             <div class="row">
                                  <div class="col" style="text-align:center">
                                      <b>${match.t1.teamName}</b>
                                  </div>                             
                                  <div class="col" style="text-align:center">
                                      <span class="flag-icon flag-icon-${match.t1.shortcut.toLowerCase()}"></span><small>${hrs}:${mins}</small><span class="flag-icon flag-icon-${match.t2.shortcut.toLowerCase()}"></span>
                                  </div>
                                  <div class="col" style="text-align:center">
                                      <b>${match.t2.teamName}</b>
                                  </div>
                              </div>
                          </div>
                          </div>
                      </div>   
              `);
      }

      if (counter < 1) {
        for (let i = counter; i < 1; i++) {
          $("#final-stage-table").append(`
                      <div class="card text-white bg-warning mb-3">
                          <div class="card-header">??:??</div>
                          <div class="card-body">
                          <div class="row">
                              <div class="col" style="text-align:center">
                              <b>??</b>
                              </div>
                              <div class="col" style="text-align:center">
                              </div>
                              <div class="col" style="text-align:center">
                              <b>??</b>
                              </div>
                          </div>
                          </div>
                      </div>
                
              `);
        }
      }
    });
  });
}

$(document).ready(function () {
  if (document.title == "Typer Cup | Mistrzostwa Świata 2022") {
    selectGroup();
    print18schedule();
    print14schedule();
    print12schedule();
    printFinal();
  }
});
