const mongoose = require("mongoose");
const Q = require("q");
const express = require("express");
const UserStats = require("./UserStatsController");
const History = require("../models/history.js");
const Edition = require("../models/edition.js");
const SiteConfig = require("./SiteController")

function transferToHistory(){

    SiteConfig.getCurrentEdition().then(edition => {
        UserStats.getAll().then(stats => {
            console.log("***")
            console.log("Rozpoczęto transfer wyników do historii")
            stats.forEach((stat, index) =>{
                var history = new History({
                    user: stat.user._id,
                    edition: edition._id,
                    result: index+1,
                    tickets: stat.tickets,
                    points: stat.points,
                    pw: stat.correctScore,
                    wd: stats.correctTeam,
                    q: stat.quizPoints,
                    p: stat.defeat
                  });
                
                  history.save(function (err, result) {
                    if(err)
                        console.log(err)
                    else{
                        console.log("***")
                        console.log("Przetransferowano do historii:")
                        console.log(result.user)
                        console.log("Rezultat: "+ result.result + " | " + 
                                    "Tickets: "+result.tickets + " | " + 
                                    "Punkty: "+result.points + " | " + 
                                    "PW: "+result.pw + " | " + 
                                    "WD: "+result.wd + " | " + 
                                    "Q: "+result.q + " | " + 
                                    "P: "+result.p)
                        console.log("***")
                    }

                  });
            })
        })
        console.log("Zakończono transfer wyników do historii")
        console.log("***")
    })

}

function getTop3OfAllEditions(){
    SiteConfig.getAllEditions().then(editions =>{
        editions.forEach(edition =>{ 

        })
    })
}

function getEditionDetails(edition){
 
    var def = Q.defer();
    History
        .find({edition:edition})
        .exec(function (err, editions) {
            err ? def.reject(err) : def.resolve(editions);
        });
    return def.promise;
    
}

module.exports = {
    transferToHistory,
    getTop3,
    getFullEdition,
    
}