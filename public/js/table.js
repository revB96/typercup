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

            $("#users-stat-table").append(`
            <tr ${yellowClass}>
                <th scope="row">${counter}</th>
                <td>${userStat.user.username}</td>
                <td><b>${userStat.points}</b></td>
                <td>${userStat.tickets}</td>
                <td>${userStat.correctScore}</td>
                <td>${userStat.correctTeam}</td>
                <td>${userStat.defeat}</td>
                <td>${userStat.correctQuestions}</td>
                <td>${quizPoints}</td>
             </tr>
            `)
        }
    })
}

$(document).ready(function () {
    listUserTable()
})