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
                quiz_questions += `<th scope="col">${index+1}<br /><br /><br /><small class="text-muted">${correct_answer}</small></th>`
            else if(question.correctAnswer.length > 10)
                quiz_questions += `<th scope="col">${index+1}<br /><small class="text-muted">${correct_answer}</small></th>`
            else
                quiz_questions += `<th scope="col">${index+1}<br /><br /><small class="text-muted">${correct_answer}</small></th>`
        })
        $("#quiz-summary-questions").append(quiz_questions)
    })
}
function printQuizSummary(){
    getAllUsernames().then(users =>{
        users.forEach(user => {
            getUserAnswers(user._id).then(async answers => {
                getQuestions().then(questions => {
                
                var nickname = user.username;
                var textSize="";
                var answers_content=""

                if(nickname.length > 12)
                    textSize="font-size:11px;"

                answers.answers.forEach(async (ans,index) =>{
                    //console.log(ans)
                    var correct_answer = questions.find(result => {
                        console.log(result)
                        return result._id == ans.questionId
                    })
                    console.log(correct_answer)
                    if(index != 0){
                        if(ans.answer == "yes"){
                            answers_content += `<td>Tak</td>`
                        }else if(ans.answer == "no"){
                            answers_content += `<td>Nie</td>`
                        }else{
                            answers_content += `<td>${ans.answer}</td>`
                        }
                    }
                })
                $("#quiz-summary-answers").append(`
                                                    <tr>
                                                        <th style="${textSize}" scope="row">${user.username}</th>
                                                        ${answers_content}
                                                    </tr>
            `);
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