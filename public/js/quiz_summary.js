function printQuizSummary(){
    getAllUsernames().then(users =>{ 
        users.forEach(user => {
            getUserAnswers(user._id).then(async answers => {
                console.log(answers.answers);

                $("#quiz-summary-answers").append(`
            <tr>
                <th scope="row">${user.username}</th>
                <td>${answers.answers[1].answer}</td>
                <td>${answers.answers[2]}</td>
                <td>${answers.answers[3]}</td>
                <td>${answers.answers[4]}</td>
                <td>${answers.answers[5]}</td>
                <td>${answers.answers[6]}</td>
                <td>${answers.answers[7]}</td>
                <td>${answers.answers[8]}</td>
                <td>${answers.answers[9]}</td>
                <td>${answers.answers[10]}</td>
                <td>${answers.answers[11]}</td>
                <td>${answers.answers[12]}</td>
                <td>${answers.answers[13]}</td>
                <td>${answers.answers[14]}</td>
                <td>${answers.answers[15]}</td>
                <td>${answers.answers[16]}</td>
                <td>${answers.answers[17]}</td>
                <td>${answers.answers[18]}</td>
                <td>${answers.answers[19]}</td>
                <td>${answers.answers[20]}</td>
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