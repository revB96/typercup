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

            if((t1g > t2g) & (userTicket.t1g > t2g) & (userTicket.schedule.t1._id == t1))
              var trClass = ""

            if ((t1g == userTicket.t1g) & (t2g == userTicket.t2g)){
              var result = "3 pkt";
              trClass = "table-success"
            }else if (
              ((t1g != userTicket.t1g) || (t2g != userTicket.t2g)) &
              ((((t1g == t2g) & (userTicket.t1g == userTicket.t2g))) || ((t1g > t2g) & (userTicket.t1g > userTicket.t2g)) || ((t1g < t2g) & (userTicket.t1g < userTicket.t2g)))
              )
            {
              var result = "1.5 pkt";
              trClass = "table-info"
            }else{
             var result = "0 pkt";
             trClass = "table-danger"
            }
            var round;
            if(userTicket.round == "quarterfinal") round = "Ćwierćfinał"
            else if(userTicket.round == "final") round = "Finał"
            else if(userTicket.round == "semifinal") round = "Półfinał"
            else if(userTicket.round == "roundof16") round = "1/16 finału"
            else round = userTicket.round 

            if ((userTicket.schedule) != null) {
              var updatedAt = new Date(userTicket.updatedAt);
              await $(`#profile-user-ticket-table`).append(`
                                    <tr class="${trClass}">
                                        <td>${round}</td>
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
            var round;
            var updatedAt = await new Date(userTicket.updatedAt);

            if(userTicket.round == "quarterfinal") round = "Ćwierćfinał"
            else if(userTicket.round == "final") round = "Finał"
            else if(userTicket.round == "semifinal") round = "Półfinał"
            else if(userTicket.round == "roundof16") round = "1/16 finału"
            else round = userTicket.round 
            
            await $(`#profile-user-ticket-table`).append(`
                        <tr>
                
                            <td>${round}</td>
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

function changeNotificationSettings(notification){
  $.post(`/api/user/notification/toggle?name=${notification}&userId=${getUserId()}`).done(() => {
    $(".toast").html(`
      <div class="toast-header">
      <strong class="mr-auto">Panel administratora</strong>
      <button type="button" class="ml-2 mb-1 close" data-dismiss="toast" aria-label="Close">
          <span aria-hidden="true">&times;</span>
      </button>
      </div>
      <div class="toast-body">
          Zaktualizowano ustawienia powiadomień
      </div>
  `);
  $(".toast").toast("show");
  printUserNotifications()
  })
}

function printUserNotifications(){
  $("#user-notifications-settings").html("")
  getUserNotifications(getUserId()).then((notifications) => {
    if (!!notifications) {
      if (notifications.newRound == true)
        $("#user-notifications-settings").append(`
            <button class="btn btn-success" type="button" onClick="changeNotificationSettings('newRound')" >Nowa kolejka</button>`);
      else
        $("#user-notifications-settings").append(`
            <button class="btn btn-secondary" type="button" onClick="changeNotificationSettings('newRound')" >Nowa kolejka</button>`);

      if (notifications.closeRound == true)
        $("#user-notifications-settings").append(`
            <button class="btn btn-success" type="button" onClick="changeNotificationSettings('closeRound')" >Zamknięcie kolejki</button>`);
      else
        $("#user-notifications-settings").append(`
            <button class="btn btn-secondary" type="button" onClick="changeNotificationSettings('closeRound')" >Zamknięcie kolejki</button>`);

      if (notifications.reminder == true)
        $("#user-notifications-settings").append(`
            <button class="btn btn-success" type="button" onClick="changeNotificationSettings('reminder')">Przypomnienie o nie wysłaniu typów na aktualną kolejkę</button>`);
      else
        $("#user-notifications-settings").append(`
            <button class="btn btn-secondary" type="button" onClick="changeNotificationSettings('reminder')">Przypomnienie o nie wysłaniu typów na aktualną kolejkę</button>`);
    }
  });
}

function getUserEmail(){

}

$(document).ready(function () {
  if(document.title == "Typer Cup | Profil"){
  $("#change-password-form-userId").val(getUserId());
  $("#change-email-form-userId").val(getUserId());
  $("#change-email-form-email").val(getUserEmail(getUserId()));

  printUserTicketsTable(getUserId());
  printUserNotifications()

  $("#change-password-form").submit(function (e) {
    e.preventDefault();
    const formData = $("#change-password-form").serializeArray();
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

  $("#change-email-form").submit(function (e) {
    e.preventDefault();
    const formData = $("#change-email-form").serializeArray();
    $.post("/api/user/change-email", formData).done(() => {
      $(".toast").html(`
                    <div class="toast-header">
                    <strong class="mr-auto">Panel administratora</strong>
                    <button type="button" class="ml-2 mb-1 close" data-dismiss="toast" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                    </div>
                    <div class="toast-body">
                        Zmieniono twój adres email
                    </div>
                `);
      $(".toast").toast("show");
    });
  });

  }
});
