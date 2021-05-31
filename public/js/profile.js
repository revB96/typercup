function checkPasswords() {
  var message = "";
  $(`#change-password-form-message`).html("");
  if (
    ($(`#password1`).val() == $(`#password2`).val()) &
    ($(`#password1`).val().length >= 6)
  ) {
    $(`#password1`).removeClass("is-invalid").addClass("is-valid");
    $(`#password2`).removeClass("is-invalid").addClass("is-valid");
    $(`#change-password-button`).removeClass("disabled");
    $("#change-password-message").html(``);
  }

  if ($(`#password1`).val().length < 6) {
    $(`#password1`).removeClass("is-valid").addClass("is-invalid");
    $(`#password2`).removeClass("is-valid").addClass("is-invalid");
    $(`#change-password-button`).addClass("disabled");
    message += "Hasło musi posiadać 6 znaków<br />";
  }

  if ($(`#password1`).val() != $(`#password2`).val()) {
    $(`#password1`).removeClass("is-valid").addClass("is-invalid");
    $(`#password2`).removeClass("is-valid").addClass("is-invalid");
    $(`#change-password-button`).addClass("disabled");
    message += `Hasła są różne<br />`;
  }

  $("#change-password-form-message").append(message);
}

function printUserTicketsTable(userId) {
  $(`#profile-user-ticket-table`).html("");
  const options = {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  getAllUserTickets(userId).then(async (userTickets) => {
    for await (const [index, userTicket] of Object.entries(userTickets)) {
      if ((await userTickets) != null) {
        if ((await userTicket.schedule.played) == true) {
          await getScheduleScore(userTicket.schedule._id).then(async (score) => {
            var t1g = score.t1g;
            var t2g = score.t2g;
            var t1 = score.schedule.t1;
            var t2 = score.schedule.t2;

            if(
              (t1g > t2g) &
              (userTicket.t1g > t2g) &
              (userTicket.schedule.t1._id == t1)
            )
              console.log("1");
            var trClass = ""
            if ((t1g == userTicket.t1g) & (t2g == userTicket.t2g)){
              var result = "3 pkt";
              trClass = "table-success"
            }else if (
              (t1g > t2g) &
                (userTicket.t1g > t2g) &
                (userTicket.schedule.t1._id == t1) ||
              (t2g > t1g) &
                (userTicket.t1g < t2g) &
                (userTicket.schedule.t2._id == t2)
            ){
              var result = "1.5 pkt";
              trClass = "table-info"
            }else{
             var result = "0 pkt";
             trClass = "table-danger"
            }

            if ((userTicket.schedule) != null) {
              var updatedAt = new Date(userTicket.updatedAt);
              await $(`#profile-user-ticket-table`).append(`
                                    <tr class="${trClass}">
                                        <td>${userTicket.round}</td>
                                        <td>${
                                          userTicket.schedule.t1.teamName} vs ${userTicket.schedule.t2.teamName}</td>
                                        <td>${userTicket.t1g}:${userTicket.t2g}</td>
                                        <td>${t1g}:${t2g}</td>
                                        <td>${result}</td>
                                        <td>${updatedAt.toLocaleDateString(
                                          "pl-PL",
                                          options
                                        )}</td>
                                    </tr>
                                    `);
            }
          });
        } else {
          if ((userTicket.schedule) != null) {
            var updatedAt = await new Date(userTicket.updatedAt);
            await $(`#profile-user-ticket-table`).append(`
                        <tr>
                
                            <td>${userTicket.round}</td>
                            <td>${userTicket.schedule.t1.teamName} vs ${userTicket.schedule.t2.teamName}</td>
                            <td>${userTicket.t1g}:${userTicket.t2g}</td>
                            <td>?:?</td>
                            <td>?</td>
                            <td>${updatedAt.toLocaleDateString(
                              "pl-PL",
                              options
                            )}</td>
                        </tr>
                        `);
          }
        }
      }
    }
  });
}

$(document).ready(function () {
  $("#change-password-form-userId").val(getUserId());
  printUserTicketsTable(getUserId());

  getUserNotifications(getUserId()).then((notifications) => {
    if (!!notifications) {
      if (notifications.newRound == true)
        $("#user-notifications-settings").append(`
            <div class="mb-3">
                <div class="form-check form-switch">
                <input class="form-check-input" type="checkbox" name="newRound" checked>
                <label class="form-check-label">Nowa kolejka</label>
                </div>
            </div>`);
      else
        $("#user-notifications-settings").append(`
            <div class="mb-3">
                <div class="form-check form-switch">
                <input class="form-check-input" type="checkbox" name="newRound">
                <label class="form-check-label">Nowa kolejka</label>
                </div>
            </div>`);

      if (notifications.daySummary == true)
        $("#user-notifications-settings").append(`
            <div class="mb-3">
                <div class="form-check form-switch">
                <input class="form-check-input" type="checkbox" name="daySummary" checked>
                <label class="form-check-label">Podsumowanie dnia</label>
                </div>
            </div>`);
      else
        $("#user-notifications-settings").append(`
            <div class="mb-3">
                <div class="form-check form-switch">
                <input class="form-check-input" type="checkbox" name="daySummary">
                <label class="form-check-label">Podsumowanie dnia</label>
                </div>
            </div>`);

      if (notifications.closeRound == true)
        $("#user-notifications-settings").append(`
            <div class="mb-3">
                <div class="form-check form-switch">
                <input class="form-check-input" type="checkbox" name="closeRound" checked>
                <label class="form-check-label">Zamknięcie kolejki</label>
                </div>
            </div>`);
      else
        $("#user-notifications-settings").append(`
            <div class="mb-3">
                <div class="form-check form-switch">
                <input class="form-check-input" type="checkbox" name="closeRound">
                <label class="form-check-label">Zamknięcie kolejki</label>
                </div>
            </div>`);

      if (notifications.reminder == true)
        $("#user-notifications-settings").append(`
            <div class="mb-3">
                <div class="form-check form-switch">
                <input class="form-check-input" type="checkbox" name="reminder" checked>
                <label class="form-check-label">Przypomnienie o nie wysłaniu typów na aktualną kolejkę</label>
                </div>
            </div>`);
      else
        $("#user-notifications-settings").append(`
            <div class="mb-3">
                <div class="form-check form-switch">
                <input class="form-check-input" type="checkbox" name="reminder">
                <label class="form-check-label">Przypomnienie o nie wysłaniu typów na aktualną kolejkę</label>
                </div>
            </div>`);
    }
  });

  $("#change-password-form").submit(function (e) {
    e.preventDefault();
    const formData = $("#change-password-form").serializeArray();
    console.log(formData);
    $.post("/api/user/changepassword", formData).done(() => {
      $(".toast").html(`
                    <div class="toast-header">
                    <strong class="mr-auto">Panel administratora</strong>
                    <button type="button" class="ml-2 mb-1 close" data-dismiss="toast" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                    </div>
                    <div class="toast-body">
                        Zmieniono hasło
                    </div>
                `);
      $(".toast").toast("show");
    });
  });
});
