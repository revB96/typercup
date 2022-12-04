function printQuizSummary(){
    getAllUsernames().then(users =>{ 
        users.forEach(user => {
            getUserAnswers(user._id).then(async answers => {
                console.log(answers.answers);

                $("#quiz-summary-answers").append(`
            <tr>
                <th scope="row">${user.username}</th>
                <td>${answers.answers[1].answer}</td>
                <td>${answers.answers[2].answer}</td>
                <td>${answers.answers[3].answer}</td>
                <td>${answers.answers[4].answer}</td>
                <td>${answers.answers[5].answer}</td>
                <td>${answers.answers[6].answer}</td>
                <td>${answers.answers[7].answer}</td>
                <td>${answers.answers[8].answer}</td>
                <td>${answers.answers[9].answer}</td>
                <td>${answers.answers[10].answer}</td>
                <td>${answers.answers[11].answer}</td>
                <td>${answers.answers[12].answer}</td>
                <td>${answers.answers[13].answer}</td>
                <td>${answers.answers[14].answer}</td>
                <td>${answers.answers[15].answer}</td>
                <td>${answers.answers[16].answer}</td>
                <td>${answers.answers[17].answer}</td>
                <td>${answers.answers[18].answer}</td>
                <td>${answers.answers[19].answer}</td>
                <td>${answers.answers[20].answer}</td>
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