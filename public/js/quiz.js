function printQuiz() {
  $("#quiz-cards").html(`<div class="d-flex justify-content-center">
    <div class="spinner-border" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
  </div>`);
   getQuestions().then(async (questions) => {
     await getUserAnswers(getUserId()).then(async (userQuestions) => {
       getUserCorrectAnswers(getUserId()).then(async (userCorrectAnswer) => {
        $("#quiz-cards").html("")
        for await (const [index, question] of Object.entries(questions)) {
          await getDictionaryByType(question.dictionary).then(async (questionDictionary) => {
          var points = 0,
              background = "",
              footer = "";
              checked =  "❌";
          if(!!userCorrectAnswer){
              for await (const [index2, correctAnswer] of Object.entries(userCorrectAnswer)){
                //console.log(question._id, correctAnswer.question)
                  if (question._id == correctAnswer.question) {
                    points += 0.5;
                    background = "text-white bg-success";
                    footer = `<div class="card-footer text-white">
                                          + 0.5 pkt
                                       </div>`;
                    break;
                  }
                  else {
                    background = "text-white bg-danger";
                    footer = `<div class="card-footer text-white">
                                         0 pkt<br /> Poprawna odpowiedź: ${question.correctAnswer}
                                       </div>`;
                  }
              }
            
            var closed = "",
              questionType = "",
              answer = "";
            var counter = new Number(index) + 1;
            var select = `<option >Wybierz odpowiedź</option>
                                  <option value="yes">TAK</option>
                                  <option value="no">NIE</option>`;

            if (question.closed == true) {
              closed = "disabled";
              $("#save-user-quiz-button").addClass(closed);
              $("#save-user-quiz-button").addClass("btn-danger");
              $("#save-user-quiz-button").html("Quiz zamknięty")
            }

            if (userQuestions != null) {
              for (var i = 1; i <= Object.keys(questions).length; i++) {
                if (userQuestions.answers[i] != undefined)
                  if (userQuestions.answers[i].questionId == question._id) {
                    checked="✅"
                    answer = userQuestions.answers[i].answer;
                  }
              }
            }
           
            if ((answer == "yes") & (question.type == "yes-no"))
              select = `<option value="yes" selected>TAK</option>
                            <option value="no">NIE</option>`;
            else if ((answer == "no") & (question.type == "yes-no"))
              select = `<option value="yes">TAK</option>
                            <option value="no" selected>NIE</option>`;

            if (question.type == "yes-no"){
              questionType = `
                                <select class="form-select" style="text-align-last: center;" name="${question._id}" ${closed}>
                                    ${select}
                                </select>`;
            }else{
              questionType = `<input value="${answer}" list="${question._id}-answers" type="text" class="form-control" style="text-align-last: center;" name="${question._id}" ${closed}>
                              <datalist id="${question._id}-answers">`;
              for await (const [index, dictionary] of Object.entries(questionDictionary)) {
                if(dictionary.param2 != "")
                  questionType += `<option value="${dictionary.param1} | ${dictionary.param2}">`;
                else
                  questionType += `<option value="${dictionary.param1}">`;
              }

              questionType += `</datalist>`;
              
            }
            await $("#quiz-cards").append(`
                        <div class="card text-center mt-3 ${background}">
                        <div class="card-header">
                            Pytanie #${counter} ${checked}
                        </div>
                        <div class="card-body">
                            <h5 class="card-title">${question.question}</h5>
                            ${questionType}
                        </div>
                        ${footer}
                        </div>
                    `);
          }
        })
        }
      });
    });
  });
}

function printQuizSummaryButton(){
  getSiteConfigs("quizSummaryButton").then(async (buttonConfig) => {
    if(buttonConfig.state == true){
      $("#quiz-summary-button").html(`<a href="https://typer-cup.pl/quiz-summary" class="btn btn-primary btn-sm" role="button">Sprawdź jak odpowiadali inni</a>`)
    }
  })
}

$(document).ready(function () {
  if (window.location.pathname === '/quiz') {
    printQuiz();
    printQuizSummaryButton();
    $("#save-user-quiz-form").submit(function (e) {
      e.preventDefault();
      const formData = $("#save-user-quiz-form").serializeArray();

      var lenght = formData.length;
      var quizAnswers = `[`;
      for (var i = 0; i < lenght; i++) {
        if (i == 0) {
          quizAnswers += JSON.stringify({
            userId: getUserId(),
          });
          quizAnswers += ",";
        }
        quizAnswers += JSON.stringify({
          questionId: formData[i].name,
          answer: formData[i].value,
        });

        if (i != lenght - 1) quizAnswers += ",";
      }
      quizAnswers += `]`;
      console.log(quizAnswers);
      $.ajax({
        url: "/api/quiz/add",
        type: "POST",
        data: quizAnswers,
        contentType: "application/json",
        complete: () => {
          //window.location.href= "/"
          $(".toast").html(`
                            <div class="toast-header">
                            <strong class="mr-auto">Typer Cup</strong>
                            <button type="button" class="ml-2 mb-1 close" data-dismiss="toast" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                            </div>
                            <div class="toast-body">
                                Zapisano twój Quiz
                            </div>
                        `);
          $(".toast").toast("show");
          printQuiz();
        },
      });
    });
  }
});
