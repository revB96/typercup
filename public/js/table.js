function listUserTable(){
    $("#users-stat-table").html(`<div class="d-flex justify-content-center">
        <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
        </div>
    </div>`)
    getUserTable().then(result=>{
        $("#users-stat-table").html("")
        for (const [index,userStat] of Object.entries(result)) {
            var counter = parseInt(index, 10) + 1;
            var yellowClass=""
            var quizPoints = "?"
            var crown="";
            var effectiveness=0;
            var effectiveness2 = 0;
            var textSize="";

            if(counter === 1)
                yellowClass = `class="bg-warning"`
            if(userStat.quizPoints != 0)
                quizPoints = userStat.quizPoints
            
            if(userStat.user.champion == true)  crown = `<img src="img/crown.svg" style="width: 24px; height: 24px"/>`

            if(isNaN(((userStat.correctScore + userStat.correctTeam) / result[0].tickets) * 100) == false)
                effectiveness = ( (userStat.correctScore + userStat.correctTeam) / result[0].tickets) * 100
            if(isNaN((userStat.points / (result[0].tickets * 3)) * 100) == false)
                effectiveness2 = (userStat.points / (result[0].tickets * 3)) * 100

            var nickname = userStat.user.username
            if(nickname.length > 12)
                textSize="font-size:11px;"
            console.log(textSize)

            $("#users-stat-table").append(`
            <tr ${yellowClass}>
                <th scope="row">${counter}</th>
                <td>
                    <button style="border-style: none; background-color: transparent; ${textSize}" id="tableButton-${userStat._id}">${userStat.user.username}${crown}</button>
                    <script>tippy('#tableButton-${userStat._id}', {
                        content: "${userStat.user.friendlyName}",
                        placement: 'right-start',
                        theme: 'material',
                      });
                    </script>
                </td>
                <td><b>${userStat.points}</b></td>
                <td>${userStat.tickets}</td>
                <td>${userStat.correctScore}</td>
                <td>${userStat.correctTeam}</td>
                <td>${userStat.defeat}</td>
                <td>${quizPoints}</td>
                <td>
                    <span style="padding:2px;margin:0" class="badge rounded-pill bg-primary">${Math.round(effectiveness)}%</span>
                    <span style="padding:2px;margin:0" class="badge rounded-pill bg-success">${Math.round(effectiveness2)}%</span>
                </td>
                
             </tr>
            `)
        }
    })
}

$(document).ready(function () {
    $('[data-toggle="popover"]').popover()
    if(document.title == "Typer Cup | Tabela"){
        listUserTable()
    }
})