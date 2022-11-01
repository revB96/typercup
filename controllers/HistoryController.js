const mongoose = require("mongoose");
const Q = require("q");
const express = require("express");
const UserStats = require("./UserStatsController");
const History = require("../models/history.js");
const SiteConfig = require("./SiteController")

function transferToHistory(){
    var def = Q.defer();
    SiteConfig.getCurrentEdition().then(currentEdition => {
        UserStats.getAll().then(stats => {
            console.log("***")
            console.log("Rozpoczęto transfer wyników do historii")
            console.log("***")
            stats.forEach((stat, index) =>{
                var history = new History({
                    user: stat.user._id,
                    edition: currentEdition._id,
                    result: index+1,
                    tickets: stat.tickets,
                    points: stat.points,
                    pw: stat.correctScore,
                    wd: stats.correctTeam,
                    q: stat.quizPoints,
                    d: stat.defeat
                  });
                
                  history.save(function (err, result) {
                    if(err){
                        def.reject(err)
                        console.log(err)
                    }else{
                        console.log("Przetransferowano do historii:")
                        console.log("ID" + result.user)
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

        SiteConfig.setTransferedEdition(currentEdition._id);

        def.resolve("Zakończono transfer wyników do historii");
        console.log("Zakończono transfer wyników do historii")
        console.log("***")
    })
    return def.promise;
}

function getTop3OfAllEditions(){
    SiteConfig.getAllEditions().then(editions =>{
        editions.forEach(edition =>{ 

        })
    })
}

function getEditionDetails(editionId){
    var def = Q.defer();
    History
        .find({edition:editionId})
        .populate("username")
        .exec(function (err, edition) {
            console.log(edition)
            err ? def.reject(err) : def.resolve(edition);
        });
    return def.promise;
    
}

module.exports = {
    transferToHistory,
    getEditionDetails
}