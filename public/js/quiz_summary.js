{/* <button style="border-style: none; background-color: transparent; ${textSize}" id="tableButton-${userStat._id}">${userStat.user.username}${crown}</button>
                    <script>tippy('#tableButton-${userStat._id}', {
                        content: "${userStat.user.friendlyName}",
                        placement: 'right-start',
                        theme: 'material',
                      });
                    </script> */}
                    
function printQuizQuestions(){
    getQuestions().then(questions => {
        var quiz_questions = `<th scope="col">User</th>`
        questions.forEach((question,index) =>{
            var correct_answer;
            if(question.correctAnswer == "yes")
                correct_answer = `Tak`
            else if(question.correctAnswer == "no")
                correct_answer = "Nie"
            else
                correct_answer = question.correctAnswer

            if(question.correctAnswer == "")
                quiz_questions += `<th scope="col"><button style="border-style: none; background-color: transparent; id="quiz-summary-question-${question._id}">${index+1}<br /><br /><br /><small class="text-muted">${correct_answer}</small></button></th>
                                    <script>tippy('#quiz-summary-question-${question._id}', {
                                        content: "${question.question}",
                                        placement: 'right-start',
                                        theme: 'material',
                                    });
                                    </script>`
            else if(question.correctAnswer.length > 10)
                quiz_questions += `<th scope="col"><button style="border-style: none; background-color: transparent; id="quiz-summary-question-${question._id}">${index+1}<br /><small class="text-muted">${correct_answer}</small></button></th>
                                    <script>tippy('#quiz-summary-question-${question._id}', {
                                        content: "${question.question}",
                                        placement: 'right-start',
                                        theme: 'material',
                                    });
                                    </script>`
            else
                quiz_questions += `<th scope="col"><button style="border-style: none; background-color: transparent; id="quiz-summary-question-${question._id}">${index+1}<br /><br /><small class="text-muted">${correct_answer}</small></button></th>
                                    <script>tippy('#quiz-summary-question-${question._id}', {
                                        content: "${question.question}",
                                        placement: 'right-start',
                                        theme: 'material',
                                    });
                                    </script>`
        })
        $("#quiz-summary-questions").append(quiz_questions)
        $("#quiz-summary-questions").append(`<th scope="col"><br /><br />Pkt</th>`)
    })
}
function printQuizSummary(){
    getAllUsernames().then(users =>{
        users.forEach(async user => {
            getUserAnswers(user._id).then(async answers => {
                getQuestions().then(async questions => {
                var points = 0;
                var nickname = user.username;
                var textSize="";
                var answers_content=""
                var td_variant ="";

                if(nickname.length > 12)
                    textSize="font-size:11px;"

                await answers.answers.forEach(async (ans,index) =>{
                    console.log(ans)
                    var correct_answer = questions.find(result => {
                        return result._id == ans.questionId
                    })
                    if(!!correct_answer){
                        if (correct_answer.correctAnswer == ans.answer){
                            td_variant = "table-success"
                            points += 0.5;
                        }else if(correct_answer.correctAnswer == "")
                            td_variant = ""
                        else  
                            td_variant = "table-danger"  
                    }

                    if(index != 0){
                        if(ans.answer == "yes"){
                            answers_content += `<td class="${td_variant}">Tak</td>`
                        }else if(ans.answer == "no"){
                            answers_content += `<td class="${td_variant}">Nie</td>`
                        }else{
                            answers_content += `<td class="${td_variant}">${ans.answer}</td>`
                        }
                    }
                })
                await $("#quiz-summary-answers").append(`<tr>
                                                        <th style="${textSize}" scope="row">${user.username}</th>
                                                        ${answers_content}
                                                        <td>${points}</td>
                                                    </tr>`);
            })
        })
        });
    })
}

$(document).ready(function () {
    if (document.title == "Typer Cup | Podsumowanie Quizu") {
      printQuizQuestions();
      printQuizSummary();
    }
})