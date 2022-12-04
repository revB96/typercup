function printQuizSummary(){
    getAllUsernames().then(users =>{
        getQuestions().then(questions => {
            var quiz_questions = `<th scope="col">User</th>`
            questions.forEach((question,index) =>{
                quiz_questions += `<th scope="col">${index+1}<br /><small>${question.correctAnswer}</small></th>`
            })
            $("#quiz-summary-questions").append(quiz_questions)
        })
        users.forEach(user => {
            getUserAnswers(user._id).then(async answers => {
                var nickname = user.username;
                var textSize="";
                var answers_content=""

                if(nickname.length > 12)
                    textSize="font-size:11px;"

                answers.answers.forEach(async (ans,index) =>{
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
                <th style"${textSize}" scope="row">${user.username}</th>
                ${answers_content}
            </tr>
            `);
            })
        });
    })
}

$(document).ready(function () {
    if (document.title == "Typer Cup | Podsumowanie Quizu") {
      printQuizSummary();
    }
})