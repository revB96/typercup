function listUserTable(){
    getUserTable().then(result=>{
        for (const [index,userStat] of Object.entries(result)) {
            var counter = parseInt(index, 10) + 1;
            var yellowClass=""
            var quizPoints = "?"
            if(counter === 1)
                yellowClass = `class="bg-warning"`
            if(userStat.quizPoints != 0)
                quizPoints = userStat.quizPoints

            var effectiveness = ( (userStat.correctScore + userStat.correctTeam) / result[0].tickets) * 100
            var effectiveness2 = (userStat.points / (result[0].tickets * 3)) * 100

            $("#users-stat-table").append(`
            <tr ${yellowClass}>
                <th scope="row">${counter}</th>
                <td>${userStat.user.username}
                <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                    ${userStats.user.friendlyName}
                    <span class="visually-hidden">unread messages</span>
                </span>
                </td>
                <td><b>${userStat.points}</b></td>
                <td>${userStat.tickets}</td>
                <td>${userStat.correctScore}</td>
                <td>${userStat.correctTeam}</td>
                <td>${userStat.defeat}</td>
                <td>${quizPoints}</td>
                <td>
                    <span class="badge rounded-pill bg-primary">${Math.round(effectiveness)}%</span><br />
                    <span class="badge rounded-pill bg-success">${Math.round(effectiveness2)}%</span>
                </td>
                
             </tr>
            `)
        }
    })
}

$(document).ready(function () {
    if(document.title == "Typer Cup | Tabela"){
        listUserTable()
    }
})