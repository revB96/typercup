function adminSelectTeams() {
  $("#add-match-select-team1").html("");
  $("#add-match-select-team2").html("");
  if ($("#add-match-select-group option:selected").text() == "[ALL]") {
    getTeams().then((result) => {
      for (const [index, team] of Object.entries(result)) {
        $("#add-match-select-team1").append(`
                    <option value="${team._id}">${team.teamName}</option>
                `);
        $("#add-match-select-team2").append(`
                    <option value="${team._id}">${team.teamName}</option>
                `);
      }
    });
  } else {
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
                        <td>${
                          team.shortcut
                        } | <span class="flag-icon flag-icon-${team.shortcut.toLowerCase()}"></span> </td> 
                        <td>${team.group}</td> 
                    </tr>
                `);
    }
  });
}

function adminGetNationalTeamsDictionary() {
  $("#nationalTeamslistOptions").html("");
  getDictionaryByType("country").then((result) => {
    for (const [index, dictionary] of Object.entries(result)) {
      counter = parseInt(index, 10);
      $("#nationalTeamslistOptions").append(`
        <option value="${dictionary.param1}">
                `);
    }
  });
}

function adminGetQuizQuestionDictionaryTypes() {
  $("#questionDictionary").html(`<option value="n/a"></option>`);
  getDictionaryTypes().then((result) => {
    for (const [index, dictionary] of Object.entries(result)) {
      $("#questionDictionary").append(`
      <option value="${dictionary}">${dictionary}</option>
                `);
    }
  });
}

function adminListDictionary() {
  var counter;
  $("#admin-dictionary-list").html("");
  getAllDictionary().then((result) => {
    for (const [index, dictionary] of Object.entries(result)) {
      counter = parseInt(index, 10);
      $("#admin-dictionary-list").append(`
                    <tr>
                        <th scope="row">${counter + 1}</th>
                        <td>${dictionary.type}</td>
                        <td>${dictionary.param1}</td> 
                        <td>${dictionary.param2}</td> 
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
      var stage = "";
      switch (schedule.stage) {
        case "group":
          stage = "Grupa";
          break;
        case "14":
          stage = "1/4";
          break;
        case "18":
          stage = "1/8";
          break;
        case "12":
          stage = "1/2";
          break;
        case "final":
          stage = "Finał";
          break;
        case "3rd_place":
          stage = "3rd_place";
          break;
        default:
          stage = "Nieokreślony";
          break;
      }

      $("#admin-schedule-list").append(`
                    <tr ${played}>
                        <th scope="row">${counter + 1}</th>
                        <td>${schedule.t1.teamName}</td>
                        <td>${schedule.t2.teamName}</td> 
                        <td>${stage}</td>
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
    for await (const [index, round] of Object.entries(result)) {
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
    $("#list-user-tabContent").html(``);
    for (const [index, user] of Object.entries(result)) {
      var lastLogon = new Date(user.lastLogon);
      var champion = "",
        firstLogon = "",
        filledQuiz = "",
        timezone = "",
        active = "";
      var active = "",
        showActive = "",
        notActive = "";
      var lastLogonMinutes = lastLogon.getMinutes();
      var lastLogonHours = lastLogon.getHours();

      if (index == 0) {
        active = "active";
        showActive = "show active";
      }
      if (typeof user.champion !== "undefined" && user.champion == true)
        champion = "checked";
      if (typeof user.firstLogon !== "undefined" && user.firstLogon == true)
        firstLogon = "checked";
      if (typeof user.filledQuiz !== "undefined" && user.filledQuiz == true)
        filledQuiz = "checked";
      if (typeof user.active !== "undefined" && user.active == true)
        active = "checked";
      else notActive = "list-group-item-dark";
      if (typeof user.timezone !== "undefined") timezone = user.timezone;
      if (lastLogonMinutes < 10) lastLogonMinutes = "0" + lastLogonMinutes;
      if (lastLogonHours < 10) lastLogonHours = "0" + lastLogonHours;

      //console.log(champion)
      $("#list-user-items").append(`
        <a class="list-group-item list-group-item-action ${notActive} ${active}" id="list-${user._id}-list" data-bs-toggle="list" href="#list-${user._id}" role="tab" aria-controls="list-${user._id}">${user.username} | <small>${user.friendlyName}</small></a>
      `);
      $("#list-user-tabContent").append(`
      <div class="tab-pane fade ${showActive}" id="list-${
        user._id
      }" role="tabpanel" aria-labelledby="list-${user._id}-list">
          <form id="edit-${
            user._id
          }-form" class="row g-3" onsubmit="return false">
            <div class="col-md-12">
              <p>
                ID: ${user._id.substr(user._id.length - 4)} | 
                Ostatnie logowanie: ${lastLogonHours}:${lastLogonMinutes} ${lastLogon.getDate()}.${
        lastLogon.getMonth() + 1
      }.${lastLogon.getFullYear()}
              </p>
              <input name="userId" type="hidden" class="form-control" value="${
                user._id
              }" />
            </div>
            <div class="col-md-6">
              <label class="form-label">Username</label>
              <input name="username" type="text" class="form-control" value="${
                user.username
              }" required />
            </div>
            <div class="col-md-6">
              <label class="form-label">Przyjazna nazwa</label>
              <input name="friendlyName" type="text" class="form-control" value="${
                user.friendlyName
              }" required />
            </div>
            <div class="col-md-6">
              <label class="form-label">E-mail</label>
              <input name="email" type="text" class="form-control" value="${
                user.email
              }" required />
            </div>
            <div class="col-md-3">
              <label class="form-label">Strefa czasowa</label>
              <input name="timezone" type="text" class="form-control" value="${timezone}" required />
            </div>
            <div class="col-md-3">
              <label class="form-label">Rola</label>
              <input name="role" type="text" class="form-control" value="${
                user.role
              }" required />
            </div>
            <div class="col-md-3">
              <input name="champion" class="form-check-input" type="checkbox" value="true" ${champion} />
              <label class="form-label">Mistrz</label>
            </div>
            <div class="col-md-3">
              <input name="firstLogon" class="form-check-input" type="checkbox" value="true" ${firstLogon} />
              <label class="form-label">Logowanie</label>
            </div>
            <div class="col-md-3">
              <input name="filledQuiz" class="form-check-input" type="checkbox" value="true" ${filledQuiz} />
              <label class="form-label">Quiz</label>
            </div>
            <div class="col-md-3">
              <input name="active" class="form-check-input" type="checkbox" value="true" ${active} />
              <label class="form-label">Aktywny</label>
            </div>
            <div class="col-md-12">
              <button class="btn btn-primary" onClick="updateUser('${
                user._id
              }')">Edytuj</button>
            </div>
          </form>
          <div class="d-grid gap-2" style="margin-top:10%" >
            <button class="btn btn-primary" type="button" onClick="resetUserPassword('${
              user._id
            }')">Reset hasła</button>
            <button class="btn btn-primary" type="button" onClick="resetUserStats('${
              user._id
            }')">Reset statystyk</button>
          </div>
      </div>
      `);
    }
  });
}

function resetUserPassword(userId) {
  $.post(`/api/admin/user/reset-password?id=${userId}`).done(() => {
    $(".toast").html(`
             <div class="toast-header">
                <strong class="mr-auto">Panel administratora</strong>
                <button type="button" class="ml-2 mb-1 close" data-dismiss="toast" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
                </div>
                <div class="toast-body">
                  Zrestartowano hasło
                </div>
            `);
    $(".toast").toast("show");
  });
}

function resetUserStats(userId) {
  $.post(`/api/admin/user/reset-stats?id=${userId}`).done(() => {
    $(".toast").html(`
             <div class="toast-header">
                <strong class="mr-auto">Panel administratora</strong>
                <button type="button" class="ml-2 mb-1 close" data-dismiss="toast" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
                </div>
                <div class="toast-body">
                  Zrestartowano statystyki
                </div>
            `);
    $(".toast").toast("show");
  });
}

function updateUser(userID) {
  //console.log(userID)
  //e.preventDefault();
  const formData = $(`#edit-${userID}-form`).serializeArray();
  //console.log(formData)
  $.post("/api/admin/user/edit", formData).done(() => {
    $(".toast").html(`
               <div class="toast-header">
                  <strong class="mr-auto">Panel administratora</strong>
                  <button type="button" class="ml-2 mb-1 close" data-dismiss="toast" aria-label="Close">
                      <span aria-hidden="true">&times;</span>
                  </button>
                  </div>
                  <div class="toast-body">
                  Zapisano zmiany
                  </div>
              `);
    adminListUsers();
    adminGetAllRandomCodes();
    $("#list-user-items").html(``);
    $("#list-user-tabContent").html(`
          <div class="spinner-border" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>`);
    $(".toast").toast("show");
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
                <strong class="mr-auto">Panel administratora | Błąd </strong>
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
    for await (const [index, round] of Object.entries(result)) {
      await $(`#admin-score-round-select`).append(
        `<option value="${round.roundDate}">${round.round}. ${round.displayName}</option>`
      );
      adminGetMatches();
    }
  });
}

function adminGetMatches() {
  $(`#admin-score-match-select`).html("");
  getRoundSchedule($("#admin-score-round-select option:selected").val()).then(
    async (result) => {
      for await (const [index, match] of Object.entries(result)) {
        if (match.played == false)
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
      getDictionaryByType(question.dictionary).then((result) => {
        var correctAnswer = "";
        var questionType = "";
        if (question.type == "yes-no") {
          questionType = `<label class="form-label">Odpowiedź</label>
                          <select id="answer-${question._id}" class="form-select">
                            <option value="yes">TAK</option>
                            <option value="no">NIE</option>
                          </select>`;
        } else {
          questionType = `<label class="form-label">Odpowiedź</label>
                        <input class="form-control" list="answerOptions-${question._id}" id="answer-${question._id}" id="answer-${question._id}" placeholder="Type to search...">
                        <datalist id="answerOptions-${question._id}">`;
          for (const [index, dictionary] of Object.entries(result)) {
            if(dictionary.param2 != "")
              questionType += `<option value="${dictionary.param1} | ${dictionary.param2}">`;
            else
              questionType += `<option value="${dictionary.param1}">`;
          }

          questionType += `</datalist>`;
        }
        if (question.correctAnswer == "") {
          correctAnswer = `<a class="btn btn-primary" data-bs-toggle="offcanvas" href="#offcanvas-${question._id}" role="button" aria-controls="offcanvas-${question._id}">
                                Dodaj odpowiedź
                             </a>`;
          $(`#offcanvas`).append(`
            <div class="offcanvas offcanvas-start" tabindex="-1" id="offcanvas-${question._id}" aria-labelledby="offcanvas-${question._id}Label">
            <div class="offcanvas-header">
                <h5 class="offcanvas-title" id="offcanvas-${question._id}Label">Dodaj odpowiedź</h5>
                <button type="button" class="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
            </div>
            <div class="offcanvas-body">
                    <div>
                    <h3>${question.question}</h3>
                    </div>
                    <div>
                        ${questionType}
                    </div>
                    <button type="submit" class="btn btn-primary mt-3" onClick="addQuestionAnswer('${question._id}')">Zapisz</button>
            </div>
            </div>
            `);
        } else correctAnswer = question.correctAnswer;

        var lp = parseInt(index) + 1;

        $(`#list-questions-table`).append(`
            <tr>
                <th scope="row">${lp}</th>
                <td>${question.question}</td>
                <td>${question.type}</td>
                <td>${correctAnswer}</td>
            </tr>
        `);
      });
    }
  });
}

function restoreDatabase(fileName) {
  $.post(`/api/admin/backups/restore?fileName=${fileName}`).done(() => {
    $(".toast").html(`
                <div class="toast-header">
                <strong class="mr-auto">Panel administratora</strong>
                <button type="button" class="ml-2 mb-1 close" data-dismiss="toast" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
                </div>
                <div class="toast-body">
                    Przywrócono bazę: ${fileName}
                </div>
            `);
    $(".toast").toast("show");
  });
}

function restoreDatabaseToBackup(fileName) {
  $.post(`/api/admin/backups/restoreToBackup?fileName=${fileName}`).done(() => {
    $(".toast").html(`
                <div class="toast-header">
                <strong class="mr-auto">Panel administratora</strong>
                <button type="button" class="ml-2 mb-1 close" data-dismiss="toast" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
                </div>
                <div class="toast-body">
                    Stworzono nową bazę z kopią: ${fileName}
                </div>
            `);
    $(".toast").toast("show");
  });
}

function adminPrintBackups() {
  $(`#admin-backups-table`).html("");
  getBackups().then(async (result) => {
    result.forEach(async (backup, index) => {
      await $(`#admin-backups-table`).append(`
      <tr>
        <th scope="row">${index + 1}</th>
        <td>${backup}</td>
        <td>
          <button type="button" class="btn btn-primary" onClick="restoreDatabase('${backup}')">Przywróć</button>
          <button type="button" class="btn btn-primary" onClick="restoreDatabaseToBackup('${backup}')">Nowa baza</button>
        </td>
      </tr>
      `);
    });
  });
}

function addQuestionAnswer(id) {
  var data = {
    id: id,
    answer: $(`#answer-${id}`).val(),
  };

  $.post("/api/admin/quiz/answer/add", data).done(() => {
    $(`#offcanvas-${id}`).toggle();
    $(".toast").html(`
                    <div class="toast-header">
                    <strong class="mr-auto">Panel administratora</strong>
                    <button type="button" class="ml-2 mb-1 close" data-dismiss="toast" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                    </div>
                    <div class="toast-body">
                        Zapisano odpowiedź
                    </div>
                `);
    $(".toast").toast("show");
    adminGetQuestions();
  });
}

function closeQuiz() {
  $.get("/api/admin/quiz/close").done(() => {
    $(".toast").html(`
                    <div class="toast-header">
                    <strong class="mr-auto">Panel administratora</strong>
                    <button type="button" class="ml-2 mb-1 close" data-dismiss="toast" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                    </div>
                    <div class="toast-body">
                        Zamknięto Quiz
                    </div>
                `);
    $(".toast").toast("show");
  });
}

function adminAddPointsFromQuiz() {
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

function adminTransferToHistory() {
  $.post("/api/admin/site/archive/transfer-current-edition").done(() => {
    $(".toast").html(`
                    <div class="toast-header">
                    <strong class="mr-auto">Panel administratora</strong>
                    <button type="button" class="ml-2 mb-1 close" data-dismiss="toast" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                    </div>
                    <div class="toast-body">
                        Przetransferowano aktualną tabelę do historii
                    </div>
                `);
    $(".toast").toast("show");
    adminPrintEditions();
    adminPrintEditionsList();
  });
}

async function adminGetAllRandomCodes() {
  $("#pills-randomCodes").html(``);
  getRandomCodes().then(async (randomCodes) => {
    for await (const [index, randomCode] of Object.entries(randomCodes)) {
      var content = `
      <div>
      <span class="badge badge-dark">${randomCode._id}</span>
      <div class="table-responsive">
      <table class="table table-sm table-hover caption-top">
        <thead class="table-light">
          <tr>
            <th scope="col">Kolejka</th>
            <th scope="col">Kod</th>
            <th scope="col" style="min-width: 170px;">Aktywny</th>
          </tr>
        </thead>
        <tbody>`;

      for (const [index, code] of Object.entries(randomCode.codes)) {
        var tableColor, active;
        var date = new Date(code.updatedAt);
        const dateOptions = {
          year: "numeric",
          month: "numeric",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        };
        var formatDate = date.toLocaleDateString("pl-PL", dateOptions);
        if (code.active == false) {
          tableColor = "danger";
          active = `${code.active} | <span class="badge rounded-pill bg-danger">${formatDate}</span>`;
        } else {
          tableColor = "success";
          active = `${code.active}`;
        }

        content += `
        <tr class="table-${tableColor}">
          <th scope="row">${code.round}</th>
          <td>${code.code.substr(code.code.length - 12)}...</td>
          <td>${active}</td>
        </tr>`;
      }

      content += `
      </tbody>
      </table>
      </div>
      </div>
      `;
      $("#pills-randomCodes").append(content);
    }
  });
}

function adminPrintEditions() {
  $(`#admin-editions-table`).html(`
    <div class="spinner-border" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>`);

  getEditions().then(async (editions) => {
    $(`#admin-editions-table`).html("");
    editions.forEach(async (edition, index) => {
      var active = ``;
      if (edition.active == true) active = `class="table-success"`;
      if (edition.transfered == true) active = `class="table-secondary"`;

      await $(`#admin-editions-table`).append(`
      <tr ${active}>
        <th scope="row">${index + 1}</th>
        <td>${edition.name}</td>
        <td>${edition.price_pool}</td>
        <td>${edition.participants}</td>
      </tr>
      `);
    });
  });
}

function adminGetSelectEditions() {
  $(`#admin-select-editions`).html("");
  getEditions().then(async (editions) => {
    editions.forEach(async (edition, index) => {
      var selected = ``;
      if (index == 0) selected = `selected`;

      await $(`#admin-select-editions`).append(`
        <option value="${edition._id}" ${selected}>${edition.name}</option>
      `);
    });
  });
}

function adminPrintEditionsList() {
  $(`#list-tab-editions`).html(`
    <div class="spinner-border" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>`);
  $(`#nav-tabEditions`).html("");
  getEditions().then(async (editions) => {
    $(`#list-tab-editions`).html(``);
    editions.forEach(async (edition, index) => {
      if (edition.transfered == true) {
        await $(`#list-tab-editions`).append(`
          <a class="list-group-item list-group-item-action" data-bs-toggle="list" href="#list-${edition._id}-editions" role="tab" aria-controls="list-${edition._id}-editions">${edition.name}</a>
          `);

        await getEditionHistory(edition._id).then(async (history, index) => {
          var tr = "";
          await history.forEach((user_history, index) => {
            tr += `<tr>
                    <td>
                      <button style="border-style: none; background-color: transparent;" id="tableHistoryEdition-Button-${user_history.user._id}">${user_history.user.username}</button>
                      <script>tippy('#tableHistoryEdition-Button-${user_history.user._id}', {
                          content: "${user_history.user.friendlyName}",
                          placement: 'right-start',
                          theme: 'material',
                        });
                      </script>
                    </td>
                    <td scope="col">${user_history.result}</th>
                    <td scope="col">${user_history.tickets}</th>
                    <td scope="col">${user_history.points}</th>
                    <td scope="col">${user_history.pw}</th>
                    <td scope="col">${user_history.wd}</th>
                    <td scope="col">${user_history.d}</th>
                    <td scope="col">${user_history.q}</th>
                  </tr>`;
          });

          await $(`#nav-tabEditions`).append(`
            <div class="tab-pane fade show" id="list-${edition._id}-editions" role="tabpanel" aria-labelledby="list-${edition._id}-editions">
              <div class="table-responsive">
                <table class="table">
                  <thead>
                    <tr>
                      <th scope="col">Nick</th>
                      <th scope="col">Wynik</th>
                      <th scope="col">Typy</th>
                      <th scope="col">Punkty</th>
                      <th scope="col">PW</th>
                      <th scope="col">WD</th>
                      <th scope="col">P</th>
                      <th scope="col">Q</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${tr}
                  </tbody>
                </table>
              </div>
            </div>
          `);
        });
      }
    });
  });
}

function adminPrintSiteConfigTable() {
  $(`#admin-config-table`).html("")
  getSiteConfigs().then(configs => {
    configs.forEach(async (config, index) => {
      $(`#admin-config-table`).append(`
      <tr>
        <td scope="col">${config.configName}</th>
        <td scope="col">${config.state}</th>
        <td scope="col">${config.value}</th>
      </tr>
      `)
    })
  })
}

$(document).ready(function () {
  if (window.location.pathname === '/admin') {
    adminGetAllRandomCodes();
    adminSelectTeams();
    adminListTeams();
    adminGetSchedule();
    adminListRound();
    adminListUsers();
    adminGetRound();
    adminGetAllScores();
    adminGetQuestions();
    adminGetMatches();
    adminPrintBackups();
    adminPrintEditions();
    adminGetSelectEditions();
    adminPrintEditionsList();
    adminListDictionary();
    adminGetNationalTeamsDictionary();
    adminGetQuizQuestionDictionaryTypes();
    adminPrintSiteConfigTable();

    $("#add-quiz-answer-form").submit(function (e) {
      e.preventDefault();
    });

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
                        Dodano nowy mecz: ${formData[3].value} ${$(
          "#add-match-machTime option:selected"
        ).text()} ${$("#add-match-select-team1 option:selected").text()} vs ${$(
          "#add-match-select-team2 option:selected"
        ).text()}
                    </div>
                `);
        $(".toast").toast("show");
        adminGetSchedule();
      });
    });

    $("#add-edition-form").submit(function (e) {
      e.preventDefault();
      const formData = $("#add-edition-form").serializeArray();
      $.post("/api/admin/site/edition/add", formData).done(() => {
        adminGetSelectEditions();
        adminPrintEditions();
        $(".toast").html(`
                    <div class="toast-header">
                    <strong class="mr-auto">Panel administratora</strong>
                    <button type="button" class="ml-2 mb-1 close" data-dismiss="toast" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                    </div>
                    <div class="toast-body">
                        Dodano nową edycje!
                    </div>
                `);
        $(".toast").toast("show");
      });
    });

    $("#set-activeEdition-form").submit(function (e) {
      e.preventDefault();
      const formData = $("#set-activeEdition-form").serializeArray();
      $.post("/api/admin/site/edition/setActive", formData).done(() => {
        $(".toast").html(`
                <div class="toast-header">
                <strong class="mr-auto">Panel administratora</strong>
                <button type="button" class="ml-2 mb-1 close" data-dismiss="toast" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
                </div>
                <div class="toast-body">
                  Zapisano!
                </div>
            `);
        adminPrintEditions();
        $(".toast").toast("show");
      });
    });

    $("#add-siteConfig-form").submit(function (e) {
      e.preventDefault();
      const formData = $("#add-siteConfig-form").serializeArray();
      $.post("/api/admin/site/config", formData).done(() => {
        $(".toast").html(`
                <div class="toast-header">
                <strong class="mr-auto">Panel administratora</strong>
                <button type="button" class="ml-2 mb-1 close" data-dismiss="toast" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
                </div>
                <div class="toast-body">
                  Zapisano!
                </div>
            `);
        adminPrintSiteConfigTable();
        $(".toast").toast("show");
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
          adminGetQuestions();
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
                        Dodano nową kolejkę
                    </div>
                `);
          $(".toast").toast("show");
          adminListRound();
          adminGetAllRandomCodes();
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
                Dodano nową reprezentacje
                </div>
            `);
        $(".toast").toast("show");
        adminListTeams();
      });
    });

    $("#addDictionaryForm").submit(function (e) {
      e.preventDefault();
      const formData = $("#addDictionaryForm").serializeArray();
      $.post("/api/admin/dictionary", formData).done(() => {
        $(".toast").html(`
                <div class="toast-header">
                <strong class="mr-auto">Panel administratora</strong>
                <button type="button" class="ml-2 mb-1 close" data-dismiss="toast" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
                </div>
                <div class="toast-body">
                Dodano nowy wpis w słowniku
                </div>
            `);
        $(".toast").toast("show");
        adminListDictionary();
        adminGetNationalTeamsDictionary();
        adminGetQuizQuestionDictionaryTypes();
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
                Dodano nowego użytkownika: ${formData[0].value}
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

    $("#addRegulationForm").submit(function (e) {
      e.preventDefault();
      const formData = $("#addRegulationForm").serializeArray();
      $.post("/api/admin/regulations", formData).done(() => {
        $(".toast").html(`
                <div class="toast-header">
                <strong class="mr-auto">Panel administratora</strong>
                <button type="button" class="ml-2 mb-1 close" data-dismiss="toast" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
                </div>
                <div class="toast-body">
                Dodano nowy wpis
                </div>
            `);
        $(".toast").toast("show");
      });
    });

  }
});
