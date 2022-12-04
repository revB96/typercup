function printQuizSummary(){
    getAllUsernames().then(users =>{ 
        users.forEach(user => {
            getUserAnswers(user._id).then(async answers => {
                var nickname = user.username;
                var textSize="";
                var answers_content=""

                if(nickname.length > 12)
                    textSize="font-size:11px;"

                answers.forEach(async (ans,index) =>{
                    if(ans[index+1].answer == "yes"){
                        answers_content =+ `<td>Tak</td>`
                    }else if(ans[index+1].answer == "no"){
                        answers_content =+ `<td>Nie</td>`
                    }else{
                        answers_content =+ `<td>${ans[index+1].answer}</td>`
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