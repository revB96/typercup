function printQuizSummary(){
    getAllUsernames().then(users =>{ 
        users.forEach(user => {
            getUserAnswers(user._id).then(async answers => {
                console.log(answers);

                $("#quiz-summary-answers").append(`
            <tr>
                <th scope="row">${user.username}</th>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
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