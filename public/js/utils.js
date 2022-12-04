function getGroup(group) {
    return $.ajax({
        url: `/api/teams?group=${group}`,
        contentType: "application/json",
        dataType: 'json',
        success: function (result) {
            return result;
        },
        fail: function (){
            console.log("Nie udało się pobrać");
        }
    })
}

function getGroupSchedule(group) {
    return $.ajax({
        url: `/api/schedule/list?group=${group}`,
        contentType: "application/json",
        dataType: 'json',
        success: function (result) {
            return result;
        },
        fail: function (){
            console.log("Nie udało się pobrać");
        }
    })
}

function getKnockoutSchedule(stage) {
    return $.ajax({
        url: `/api/schedule/knockout?stage=${stage}`,
        contentType: "application/json",
        dataType: 'json',
        success: function (result) {
            return result;
        },
        fail: function (){
            console.log("Nie udało się pobrać");
        }
    })
}

function getTeams() {
    return $.ajax({
        url: `/api/teams/list`,
        contentType: "application/json",
        dataType: 'json',
        success: function (result) {
            return result;
        },
        fail: function (){
            console.log("Nie udało się pobrać");
        }
    })
}

function getSchedule() {
    return $.ajax({
        url: `/api/schedule/list`,
        contentType: "application/json",
        dataType: 'json',
        success: function (result) {
            return result;
        },
        fail: function (){
            console.log("Nie udało się pobrać");
        }
    })
}

function get18Schedule() {
    return $.ajax({
        url: `/api/schedule/get18`,
        contentType: "application/json",
        dataType: 'json',
        success: function (result) {
            return result;
        },
        fail: function (){
            console.log("Nie udało się pobrać");
        }
    })
}

function get14Schedule() {
    return $.ajax({
        url: `/api/schedule/get14`,
        contentType: "application/json",
        dataType: 'json',
        success: function (result) {
            return result;
        },
        fail: function (){
            console.log("Nie udało się pobrać");
        }
    })
}

function get12Schedule() {
    return $.ajax({
        url: `/api/schedule/get12`,
        contentType: "application/json",
        dataType: 'json',
        success: function (result) {
            return result;
        },
        fail: function (){
            console.log("Nie udało się pobrać");
        }
    })
}

function getFinalSchedule() {
    return $.ajax({
        url: `/api/schedule/getFinal`,
        contentType: "application/json",
        dataType: 'json',
        success: function (result) {
            return result;
        },
        fail: function (){
            console.log("Nie udało się pobrać");
        }
    })
}

function getRound(state){
    return $.ajax({
        url: `/api/round/get?state=${state}`,
        contentType: "application/json",
        dataType: 'json',
        success: function (result) {
            return result;
        },
        fail: function (){
            console.log("Nie udało się pobrać");
        }
    })
}

function getTicketsStats(scheduleId){
    return $.ajax({
        url: `/api/tickets/stats?scheduleId=${scheduleId}`,
        contentType: "application/json",
        dataType: 'json',
        success: function (result) {
            return result;
        },
        fail: function (){
            console.log("Nie udało się pobrać");
        }
    })
}

function getRoundSchedule(roundDate){
    return $.ajax({
        url: `/api/schedule/round?roundDate=${roundDate}`,
        contentType: "application/json",
        dataType: 'json',
        success: function (result) {
            return result;
        },
        fail: function (){
            console.log("Nie udało się pobrać");
        }
    })
}

function getAllScores(){
    return $.ajax({
        url: `/api/scores`,
        contentType: "application/json",
        dataType: 'json',
        success: function (result) {
            return result;
        },
        fail: function (){
            console.log("Nie udało się pobrać");
        }
    })
}

function getScoresByDate(roundDate){
    return $.ajax({
        url: `/api/scores?roundDate=${roundDate}`,
        contentType: "application/json",
        dataType: 'json',
        success: function (result) {
            return result;
        },
        fail: function (){
            console.log("Nie udało się pobrać");
        }
    })
}

function adminGetUsers(){
    return $.ajax({
        url: `/api/admin/user/`,
        contentType: "application/json",
        dataType: 'json',
        success: function (result) {
            return result;
        },
        fail: function (){
            console.log("Nie udało się pobrać");
        }
    })
}

function getUserById(id){
    return $.ajax({
        url: `/api/user?id=${id}`,
        contentType: "application/json",
        dataType: 'json',
        success: function (result) {
            return result;
        },
        fail: function (){
            console.log("Nie udało się pobrać");
        }
    })
}

function getUserNotifications(id){
    return $.ajax({
        url: `/api/user-notifications?id=${id}`,
        contentType: "application/json",
        dataType: 'json',
        success: function (result) {
            return result;
        },
        fail: function (){
            console.log("Nie udało się pobrać");
        }
    })
}

function getUserEmail(id){
    return $.ajax({
        url: `/api/user/email?id=${id}`,
        contentType: "application/json",
        dataType: 'json',
        success: function (result) {
            return result;
        },
        fail: function (){
            console.log("Nie udało się pobrać");
        }
    })
}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

function getUserId(){
    var decoded = jwt_decode(getCookie("access_token"));
    return decoded.user._id
}

function checkIfTokenExists(){
    if(!getCookie("access_token"))
        return 0
    else
        return 1
}

function getUserTickets(userId, round){
    return $.ajax({
        url: `/api/tickets?userId=${userId}&round=${round}`,
        contentType: "application/json",
        dataType: 'json',
        success: function (result) {
            return result;
        },
        fail: function (){
            console.log("Nie udało się pobrać");
        }
    })
}

function getUserTimezone(userId){
    return $.ajax({
        url: `/api/user/timezone?userId=${userId}`,
        contentType: "application/json",
        dataType: 'json',
        success: function (result) {
            return result;
        },
        fail: function (){
            console.log("Nie udało się pobrać");
        }
    })
}

function getUserTable(){
    return $.ajax({
        url: `/api/user/table`,
        contentType: "application/json",
        dataType: 'json',
        success: function (result) {
            return result;
        },
        fail: function (){
            console.log("Nie udało się pobrać");
        }
    })
}


function getRoundTickets(round){
    return $.ajax({
        url: `/api/tickets?round=${round}`,
        contentType: "application/json",
        dataType: 'json',
        success: function (result) {
            return result;
        },
        fail: function (){
            console.log("Nie udało się pobrać");
        }
    })
}

function getQuestions(){
    return $.ajax({
        url: `/api/quiz/questions`,
        contentType: "application/json",
        dataType: 'json',
        success: function (result) {
            return result;
        },
        fail: function (){
            console.log("Nie udało się pobrać");
        }
    })
}

function getUserCorrectAnswers(id){
    return $.ajax({
        url: `/api/quiz/correctAnswers?user=${id}`,
        contentType: "application/json",
        dataType: 'json',
        success: function (result) {
            return result;
        },
        fail: function (){
            console.log("Nie udało się pobrać");
        }
    })
}

function getUserAnswers(id){
    return $.ajax({
        url: `/api/quiz/answers?userId=${id}`,
        contentType: "application/json",
        dataType: 'json',
        success: function (result) {
            return result;
        },
        fail: function (){
            console.log("Nie udało się pobrać");
        }
    })
}

function getAllUserTickets(id){
    return $.ajax({
        url: `/api/user/tickets?userId=${id}`,
        contentType: "application/json",
        dataType: 'json',
        success: function (result) {
            return result;
        },
        fail: function (){
            console.log("Nie udało się pobrać");
        }
    })
}

function getScheduleScore(id){
    return $.ajax({
        url: `/api/score/schedule?id=${id}`,
        contentType: "application/json",
        dataType: 'json',
        success: function (result) {
            return result;
        },
        fail: function (){
            console.log("Nie udało się pobrać");
        }
    })
}

function getBackups(id){
    return $.ajax({
        url: `/api/admin/backups`,
        contentType: "application/json",
        dataType: 'json',
        success: function (result) {
            return result;
        },
        fail: function (){
            console.log("Nie udało się pobrać");
        }
    })
}


function getLastRound(){
    return $.ajax({
        url: `/api/round/last`,
        contentType: "application/json",
        dataType: 'json',
        success: function (result) {
            return result;
        },
        fail: function (){
            console.log("Nie udało się pobrać");
        }
    })
}

function getRoundByStage(round){
    return $.ajax({
        url: `/api/round/get?round=${round}`,
        contentType: "application/json",
        dataType: 'json',
        success: function (result) {
            return result;
        },
        fail: function (){
            console.log("Nie udało się pobrać");
        }
    })
}

function checkIfRoundIsOpen(userId){
    return $.ajax({
        url: `/api/round/checkifopen?userId=${userId}`,
        contentType: "application/json",
        dataType: 'json',
        success: function (result) {
            return result;
        },
        fail: function (){
            console.log("Nie udało się pobrać");
        }
    })
}

function resetTeamStats(){
    $.ajax({
        url: `/api/admin/teamstats/reset`,
        method: 'delete',
        contentType: "application/json",
        dataType: 'json',
        success: function (result) {
            return result;
        },
        fail: function (){
            console.log("Nie udało się pobrać");
        }
    })
}

function testRoundNotification(){
    $.ajax({
        url: `/api/admin/test/sendRoundNotification`,
        method: 'post',
        contentType: "application/json",
        dataType: 'json',
        success: function (result) {
            return result;
        },
        fail: function (){
            console.log("Nie udało się pobrać");
        }
    })
}

function getRandomCodes(){
    return $.ajax({
        url: `/api/admin/randomCodes`,
        method: 'get',
        contentType: "application/json",
        dataType: 'json',
        success: function (result) {
            return result;
        },
        fail: function (){
            console.log("Nie udało się pobrać");
        }
    })
}

function getEditions(){
    return $.ajax({
        url: `/api/admin/site/edition/get`,
        method: 'get',
        contentType: "application/json",
        dataType: 'json',
        success: function (result) {
            return result;
        },
        fail: function (){
            console.log("Nie udało się pobrać");
        }
    })
}

function getEditionHistory(editionId){
    return $.ajax({
        url: `/api/archive/get?edition=${editionId}`,
        method: 'get',
        contentType: "application/json",
        dataType: 'json',
        success: function (result) {
            return result;
        },
        fail: function (){
            console.log("Nie udało się pobrać");
        }
    })
}

function getAllUsernames(){
    return $.ajax({
        url: `/user/get-all-usernames`,
        method: 'get',
        contentType: "application/json",
        dataType: 'json',
        success: function (result) {
            return result;
        },
        fail: function (){
            console.log("Nie udało się pobrać");
        }
    })
}

function getCountFinishedRound(){
    return $.ajax({
        url: `/api/round/finished/count`,
        method: 'get',
        contentType: "application/json",
        dataType: 'json',
        success: function (result) {
            return result;
        },
        fail: function (){
            console.log("Nie udało się pobrać");
        }
    })
}

$(document).ready(function () {
    if(checkIfTokenExists() == 1){
        var decoded = jwt_decode(getCookie("access_token"));
        $('.username').html(`
            <a class="nav-link username" aria-current="page" href="/profile">(${decoded.user.username})</a>`)
        
        $('#logoff').html(`<a class="nav-link" aria-current="page" href="/logout">Wyloguj</a>`)

        if(decoded.user.role == "admin")
            $(".site-menu").append(`<a class="list-group-item list-group-item-action bg-light" href="/admin">Panel administratora</a>`)
    }
})


