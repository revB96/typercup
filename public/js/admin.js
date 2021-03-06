function adminSelectTeams() {
  $("#add-match-select-team1").html("");
  $("#add-match-select-team2").html("");
  if($("#add-match-select-group option:selected").text() == '[ALL]'){
    getTeams().then((result) => {
      for (const [index, team] of Object.entries(result)) {
        $("#add-match-select-team1").append(`
                    <option value="${team._id}">${team.teamName}</option>
                `);
        $("#add-match-select-team2").append(`
                    <option value="${team._id}">${team.teamName}</option>
                `);
      }
    })
  }else{
    getGroup($("#add-match-select-group option:selected").text()).then(
      (result) => {
        for (const [index, team] of Object.entries(result)) {
          $("#add-match-select-team1").append(`
                      <option value="${team._id}">${team.teamName}</option>
                  `);
          $("#add-match-select-team2").append(`
                      <option value="${team._id}">${team.teamName}</option>
                  `);
        }
        //printSchedule(result)
      }
    );
  }
}

function adminListTeams() {
  var counter;
  $("#admin-team-list").html("");
  getTeams().then((result) => {
    for (const [index, team] of Object.entries(result)) {
      counter = parseInt(index, 10);
      $("#admin-team-list").append(`
                    <tr>
                        <th scope="row">${counter + 1}</th>
                        <td>${team.teamName}</td>
                        <td>${team.shortcut}</td> 
                        <td>${team.group}</td> 
                    </tr>
                `);
    }
  });
}

function adminGetSchedule() {
  var counter,
  played = "";
  $("#admin-schedule-list").html("");
  getSchedule().then((result) => {
    var matchDate;
    const options = {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    for (const [index, schedule] of Object.entries(result)) {
      matchDate = new Date(schedule.matchDate);
      counter = parseInt(index, 10);
      schedule.played == true
        ? (played = `class="table-danger"`)
        : (played = "");
      $("#admin-schedule-list").append(`
                    <tr ${played}>
                        <th scope="row">${counter + 1}</th>
                        <td>${schedule.t1.teamName}</td>
                        <td>${schedule.t2.teamName}</td> 
                        <td>${matchDate.toLocaleDateString(
                          "pl-PL",
                          options
                        )}</td> 
                    </tr>
                `);
    }
  });
}

function adminListRound() {
  $("#list-round-table").html("");
  const options = { year: "numeric", month: "numeric", day: "numeric" };
  getRound("all").then(async (result) => {
    for await(const [index, round] of Object.entries(result)) {
      var roundControl = "";
      var roundDate = new Date(round.roundDate);
      switch (round.state) {
        case "unstarted":
          roundControl = `<button type="button" class="btn btn-success" onClick="adminChangeStatus('running', '${round._id}')"><i class="bi bi-caret-right-fill" style="color: white;"></i></button>`;
          break;
        case "running":
          roundControl = `<button type="button" class="btn btn-warning" onClick="adminChangeStatus('finished', '${round._id}')" ><i class="bi bi-square-fill" style="color: white;"></i></button>`;
          break;
        case "finished":
          roundControl = `<button type="button" class="btn btn-dark">X</button>`;
          break;
      }
      await $("#list-round-table").append(`
                    <tr>
                        <th scope="row">${round.displayName}</th>
                        <td>${roundDate.toLocaleDateString(
                          "pl-PL",
                          options
                        )}</td>
                        <td>${round.state}</td>
                        <td class="${round._id}">${roundControl}</td>
                    </tr>
                `);
    }
  });
}

function adminListUsers() {
  $("#list-user-table").html("");
  const options = {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  adminGetUsers().then((result) => {
    for (const [index, user] of Object.entries(result)) {
      var lastLogon = new Date(user.lastLogon);
      $("#list-user-table").append(`
                <tr>
                    <th scope="row">${user._id.substr(user._id.length - 4)}</th>
                    <td>${user.username}</td>
                    <td>${user.email}</td>
                    <td>${user.role}</td>
                    <td>${user.firstLogon}</td>
                    <td>${user.filledQuiz}</td>
                    <td>${lastLogon.toLocaleDateString("pl-PL", options)}</td>
                </tr>
                `);
    }
  });
}

function adminChangeStatus(status, roundId) {
  $.post(`/api/admin/round/changestatus?roundId=${roundId}&status=${status}`)
    .done(() => {
      $(".toast").html(`
                <div class="toast-header">
                <strong class="mr-auto">Panel administratora</strong>
                <button type="button" class="ml-2 mb-1 close" data-dismiss="toast" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
                </div>
                <div class="toast-body">
                    Zmieniono status kolejki
                </div>
            `);
      $(".toast").toast("show");
      adminListRound();
    })
    .fail((xhr, textStatus, errorThrown) => {
      $(".toast").html(`
                <div class="toast-header">
                <strong class="mr-auto">Panel administratora | B????d </strong>
                <button type="button" class="ml-2 mb-1 close" data-dismiss="toast" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
                </div>
                <div class="toast-body">
                    ${xhr.responseJSON}
                </div>
            `);
      $(".toast").toast("show");
    });
}

function adminGetRound() {
  getRound("all").then(async (result) => {
    for await(const [index, round] of Object.entries(result)) {
      await $(`#admin-score-round-select`).append(
        `<option value="${round.roundDate}">${round.round}. ${round.displayName}</option>`
      );
    }
  });
}

function adminGetMatches() {
  $(`#admin-score-match-select`).html("");
  getRoundSchedule($("#admin-score-round-select option:selected").val()).then(
    async (result) => {
      for await(const [index, match] of Object.entries(result)) {
        if(match.played == false)
          await $(`#admin-score-match-select`).append(
            `<option value="${match._id}">${index}. | ${match.t1.teamName} vs ${match.t2.teamName}</option>`
          );
      }
    }
  );
}

function adminGetAllScores() {
  const options = {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  $(`#list-score-table`).html("");
  getAllScores().then((result) => {
    for (const [index, score] of Object.entries(result)) {
      var matchDate = new Date(score.schedule.matchDate);
      $(`#list-score-table`).append(`
            <tr>
                    <th scope="row">${matchDate.toLocaleDateString(
                      "pl-PL",
                      options
                    )}</th>
                    <td>${score.schedule.t1.teamName}</td>
                    <td>${score.t1g}</td>
                    <td>:</td>
                    <td>${score.t2g}</td>
                    <td>${score.schedule.t2.teamName}</td>
                </tr>
            `);
    }
  });
}

function adminGetQuestions() {
  $(`#list-questions-table`).html(``);
  getQuestions().then((questions) => {
    for (const [index, question] of Object.entries(questions)) {
        var correctAnswer = ""
        var questionType = ""
        if(question.type == "yes-no")
            questionType=`<label class="form-label">Odpowied??</label>
                          <select id="answer-${question._id}" class="form-select">
                            <option value="yes">TAK</option>
                            <option value="no">NIE</option>
                          </select>`
        else
            questionType=`<label class="form-label">Odpowied??</label>
                          <input id="answer-${question._id}" type="text" class="form-control">`

        if(question.correctAnswer == ""){
            correctAnswer = `<a class="btn btn-primary" data-bs-toggle="offcanvas" href="#offcanvas-${question._id}" role="button" aria-controls="offcanvas-${question._id}">
                                Dodaj odpowied??
                             </a>`
            $(`#offcanvas`).append(`
            <div class="offcanvas offcanvas-start" tabindex="-1" id="offcanvas-${question._id}" aria-labelledby="offcanvas-${question._id}Label">
            <div class="offcanvas-header">
                <h5 class="offcanvas-title" id="offcanvas-${question._id}Label">Dodaj odpowied??</h5>
                <button type="button" class="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
            </div>
            <div class="offcanvas-body">
                    <div>
                    adminGetMatches <h3>${question.question}</h3>
                    </div>
                    <div>
                        ${questionType}
                    </div>
                    <button type="submit" class="btn btn-primary mt-3" onClick="addQuestionAnswer('${question._id}')">Zapisz</button>
            </div>
            </div>
            `)
        }   
        else
            correctAnswer = question.correctAnswer
            
        $(`#list-questions-table`).append(`
            <tr>
                <th scope="row">${question._id.substr(question._id.length - 4)}</th>
                <td>${question.question}</td>
                <td>${question.type}</td>
                <td>${correctAnswer}</td>
            </tr>
        `);
        }
  });
}

function restoreDatabase(fileName){
  $.post(`/api/admin/backups/restore?fileName=${fileName}`).done(() => {
    $(".toast").html(`
                <div class="toast-header">
                <strong class="mr-auto">Panel administratora</strong>
                <button type="button" class="ml-2 mb-1 close" data-dismiss="toast" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
                </div>
                <div class="toast-body">
                    Przywr??cono baz??: ${fileName}
                </div>
            `);
  $(".toast").toast("show");
  })
}

function adminPrintBackups(){
  $(`#admin-backups-table`).html("")
  getBackups().then(async (result) =>{
    var counter = 1
    result.forEach(async backup =>{
      await $(`#admin-backups-table`).append(`
      <tr>
        <th scope="row">${counter}</th>
        <td>${backup}</td>
        <td><button type="button" class="btn btn-primary" onClick="restoreDatabase('${backup}')">Przywr????</button></td>
      </tr>
      `)
      counter ++
    })
  })
}

function addQuestionAnswer(id){
    var data = {
        id: id,
        answer: $(`#answer-${id}`).val()
    };

    $.post("/api/admin/quiz/answer/add", data).done(() => {
        $(`#offcanvas-${id}`).toggle()
        $(".toast").html(`
                    <div class="toast-header">
                    <strong class="mr-auto">Panel administratora</strong>
                    <button type="button" class="ml-2 mb-1 close" data-dismiss="toast" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                    </div>
                    <div class="toast-body">
                        Zapisano odpowied??
                    </div>
                `);
      $(".toast").toast("show");
      adminGetQuestions();
    })
}

function closeQuiz(){
  $.get("/api/admin/quiz/close").done(() => {
    $(".toast").html(`
                    <div class="toast-header">
                    <strong class="mr-auto">Panel administratora</strong>
                    <button type="button" class="ml-2 mb-1 close" data-dismiss="toast" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                    </div>
                    <div class="toast-body">
                        Zamkni??to Quiz
                    </div>
                `);
      $(".toast").toast("show");
    });
}

function adminAddPointsFromQuiz(){
  $.get("/api/admin/quiz/addpoints").done(() => {
    $(".toast").html(`
                    <div class="toast-header">
                    <strong class="mr-auto">Panel administratora</strong>
                    <button type="button" class="ml-2 mb-1 close" data-dismiss="toast" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                    </div>
                    <div class="toast-body">
                        Dodano punkty z Quizu
                    </div>
                `);
      $(".toast").toast("show");
    });
}

$(document).ready(function () {
  if(document.title == "Typer Cup | Admin"){
    adminSelectTeams();
    adminListTeams();
    adminGetSchedule();
    adminListRound();
    adminListUsers();
    adminGetRound();
    adminGetAllScores();
    adminGetQuestions();
    adminGetMatches()
    adminPrintBackups()

  $("#add-quiz-answer-form").submit(function (e) {
    e.preventDefault();
  })

  $("#create-backup-form").submit(function (e) {
    e.preventDefault();
    const formData = $("#create-backup-form").serializeArray();
    $.post("/api/admin/backups/create", formData).always(() => {
      $(".toast").html(`
                    <div class="toast-header">
                    <strong class="mr-auto">Panel administratora</strong>
                    <button type="button" class="ml-2 mb-1 close" data-dismiss="toast" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                    </div>
                    <div class="toast-body">
                        Stworzono nowy backup
                    </div>
                `);
      $(".toast").toast("show");
      adminPrintBackups();
    });
  });

  $("#add-schedule-form").submit(function (e) {
    e.preventDefault();
    const formData = $("#add-schedule-form").serializeArray();
    $.post("/api/admin/schedule/add", formData).done(() => {
      $(".toast").html(`
                    <div class="toast-header">
                    <strong class="mr-auto">Panel administratora</strong>
                    <button type="button" class="ml-2 mb-1 close" data-dismiss="toast" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                    </div>
                    <div class="toast-body">
                        Dodano nowy mecz: ${formData[3].value} ${$("#add-match-machTime option:selected").text()} ${$("#add-match-select-team1 option:selected").text()} vs ${$("#add-match-select-team2 option:selected").text()}
                    </div>
                `);
      $(".toast").toast("show");
      adminGetSchedule();
    });
  });

  $("#add-quiz-question-form").submit(function (e) {
    e.preventDefault();
    const formData = $("#add-quiz-question-form").serializeArray();
    $.post("/api/admin/quiz/add", formData)
      .done(() => {
        $(".toast").html(`
                    <div class="toast-header">
                    <strong class="mr-auto">Panel administratora</strong>
                    <button type="button" class="ml-2 mb-1 close" data-dismiss="toast" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                    </div>
                    <div class="toast-body">
                        Dodano nowe pytanie do Quizu
                    </div>
                `);
        adminGetQuestions()
        $(".toast").toast("show");
      })
      .fail((xhr, status, error) => {
        $(".toast").html(`
                    <div class="toast-header">
                    <strong class="mr-auto">Panel administratora | Error</strong>
                    <button type="button" class="ml-2 mb-1 close" data-dismiss="toast" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                    </div>
                    <div class="toast-body">
                        ${error}
                    </div>
                `);
        $(".toast").toast("show");
      });
  });

  $("#add-round-form").submit(function (e) {
    e.preventDefault();
    const formData = $("#add-round-form").serializeArray();
    $.post("/api/admin/round/add", formData)
      .done(() => {
        $(".toast").html(`
                    <div class="toast-header">
                    <strong class="mr-auto">Panel administratora</strong>
                    <button type="button" class="ml-2 mb-1 close" data-dismiss="toast" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                    </div>
                    <div class="toast-body">
                        Dodano now?? kolejk??
                    </div>
                `);
        $(".toast").toast("show");
        adminListRound();
      })
      .fail((xhr, status, error) => {
        $(".toast").html(`
                    <div class="toast-header">
                    <strong class="mr-auto">Panel administratora | Error</strong>
                    <button type="button" class="ml-2 mb-1 close" data-dismiss="toast" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                    </div>
                    <div class="toast-body">
                        ${error}
                    </div>
                `);
        $(".toast").toast("show");
      });
  });

  $("#addTeamForm").submit(function (e) {
    e.preventDefault();
    const formData = $("#addTeamForm").serializeArray();
    $.post("/api/admin/teams/add", formData).done(() => {
      $(".toast").html(`
                <div class="toast-header">
                <strong class="mr-auto">Panel administratora</strong>
                <button type="button" class="ml-2 mb-1 close" data-dismiss="toast" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
                </div>
                <div class="toast-body">
                Dodano now?? reprezentacje
                </div>
            `);
      $(".toast").toast("show");
      adminListTeams();
    });
  });

  $("#add-user-form").submit(function (e) {
    e.preventDefault();
    const formData = $("#add-user-form").serializeArray();
    $.post("/api/admin/user/add", formData).done(() => {
      $(".toast").html(`
                <div class="toast-header">
                <strong class="mr-auto">Panel administratora</strong>
                <button type="button" class="ml-2 mb-1 close" data-dismiss="toast" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
                </div>
                <div class="toast-body">
                Dodano nowego u??ytkownika: ${formData[0].value}
                </div>
            `);
      adminListUsers();
      $(".toast").toast("show");
    });
  });

  $("#add-score-form").submit(function (e) {
    e.preventDefault();
    const formData = $("#add-score-form").serializeArray();
    $.post("/api/admin/score/add", formData).done(() => {
      $(".toast").html(`
                <div class="toast-header">
                <strong class="mr-auto">Panel administratora</strong>
                <button type="button" class="ml-2 mb-1 close" data-dismiss="toast" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
                </div>
                <div class="toast-body">
                Dodano wynik meczu: ${$(
                  "#admin-score-match-select option:selected"
                ).text()} (${formData[2].value}:${formData[3].value})
                </div>
            `);
      adminGetAllScores();
      $(".toast").toast("show");
    });
  });
}
});
