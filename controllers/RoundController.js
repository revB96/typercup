const mongoose = require("mongoose");
const Q = require("q");
const express = require("express");
const Round = require("../models/rounds.js");
const moment = require('moment-timezone');
const Schedule = require("./ScheduleController");
//const User = require("./UserController")

function add(formData){
    var def = Q.defer();

    var round = new Round({
        round : formData.round,
        displayName : formData.displayName,
        roundDate : formData.roundDate,
    })

    round.save((function(err, result){
        if(err){
            def.reject(err)
            console.log("Błąd przy dodawaniu kolejki! Treść błędu: ")
            console.log(err)
        }
        else{
            def.resolve(result);
            console.log("Dodano nową kolejkę: ")
            console.log(`Nazwa wyświetlania: ${formData.displayName}, Data: ${formData.roundDate}`)
        }
    }));

    
    return def.promise;
}

function getKnockoutSchedule(stage){
    var def = Q.defer();

    getRoundByStage(stage).then(round =>{
        var startDate = new Date(round.roundDate)
        var endDate = new Date(round.roundDate)
    
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        Schedule.getMatchesBetweenDates(startDate,endDate).then(result =>{
            def.resolve(result);
        })
        

    })
    return def.promise;
}

function getRound(state) {
    var def = Q.defer();
    if (state == "all"){
        Round
            .find()
            .sort({roundDate: "asc"})
            .exec(function (err, round) {
                err ? def.reject(err) : def.resolve(round);
            });
    }else{
        Round
            .find({state:state})
            .exec(function (err, round) {
                err ? def.reject(err) : def.resolve(round);
            });
    }
    
    return def.promise;
}

function getRoundByStage(stage){
    var def = Q.defer();
    Round
        .findOne({round:stage})
        .exec(function (err, round) {
            err ? def.reject(err) : def.resolve(round);
        });
    return def.promise;
}


function update(data)
{
    var def = Q.defer();
    var id = data.id;
    delete data.id;
    let timestamp = Date.now();

    Action.findByIdAndUpdate(id,{
        component: data.component,
        gpio: data.gpio,
        scene: data.scene,
        lastStatus: "Updated",
        updatedAt: moment.tz(timestamp, "Europe/Warsaw"),
    },{
        new:true
    }).exec(function (err, action){
        err ? def.reject(err) : def.resolve(action);
    })
    return def.promise;
}

function countRunningRound(){
    var def = Q.defer();
    Round
        .findOne({state:"running"})
        .count()
        .exec(function (err, round) {
            err ? def.reject(err) : def.resolve(round);
        });
    return def.promise;
}

function changeStatus(roundId, newState){
    var def = Q.defer();

    if(newState == "running"){
        countRunningRound().then(runningRound =>{
            //console.log(runningRound)
            if(runningRound == 0){
                Round.findByIdAndUpdate(roundId,{
                    state : newState
                },{
                    new:true
                }).exec(function (err, round){
                    console.log(`Zmieniono status ${round.displayName} na ${round.state}`)
                    err ? def.reject(err) : def.resolve(round);
                    Schedule.getFirstRoundMatch(round.roundDate).then(firstMatch =>{
                        User.roundEmailNotification(firstMatch[0].matchDate)
                    })
                      
                }) 
            }else{
                console.log("Istnieje już aktywna runda. Zakończ wszystkie rozpoczęte kolejki.")
                var err = new Error(`Istnieje już aktywna runda. Zakończ wszystkie rozpoczęte kolejki.`)
                def.reject(err)
            }
        })
    }else{
        Round.findByIdAndUpdate(roundId,{
            state : newState
        },{
            new:true
        }).exec(function (err, round){
            err ? def.reject(err) : def.resolve(round);
            console.log(`Zmieniono status ${round.displayName} na ${round.state}`)
        }) 
    }
    return def.promise;
}

function getRunningRound(){
    var def = Q.defer();
    Round
        .findOne({state:"running"})
        .exec(function (err, round) {
            err ? def.reject(err) : def.resolve(round);
        });
    return def.promise;
  }

async function getPreviousRound(){
    var round = await Round
                    .find()
                    .sort({roundDate: "desc"})
                    .limit(1)
                    .select("round")
                    .exec();
    if(!!round)
        return 0
    else
        return round[0]
}

async function getPreviousRoundDetails(){
    var def = Q.defer();
    Round
        .find()
        .sort({roundDate: "asc"})
        .limit(1)
        .exec(function (err, round){
            err ? def.reject(err) : def.resolve(round);
        })

    return def.promise;

}


module.exports = {
    add,
    getRound,
    changeStatus,
    countRunningRound,
    getRoundByStage,
    getKnockoutSchedule,
    getPreviousRound,
    getPreviousRoundDetails
}