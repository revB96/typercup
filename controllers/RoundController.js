const mongoose = require("mongoose");
const Q = require("q");
const express = require("express");
const Round = require("../models/rounds.js");
const {getFirstRoundMatch} = require("./ScheduleController.js");

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

function getRound(state) {
    var def = Q.defer();
    if (state == "all"){
        Round
            .find()
            .sort({round: "asc"})
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
        updatedAt: timestamp,
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

function getRunningRound(){
    var def = Q.defer();
    Round
        .findOne({state:"running"})
        .exec(function (err, round) {
            err ? def.reject(err) : def.resolve(round);
        });
    return def.promise;
}

function checkIfRoundIsOpen(){
    var def = Q.defer();
    getRunningRound().then(runningRound => {
        if(!!runningRound){
            getFirstRoundMatch(runningRound.roundDate).then(firstMatch => {
                var matchDate = new Date(firstMatch[0].matchDate)
                var timestamp = new Date(Date.now());
                // console.log(timestamp.getHours())
                // console.log(matchDate.getHours() - 1)
                // console.log(timestamp.getDay())
                // console.log(matchDate.getDay())
                if(timestamp.getHours() >= matchDate.getHours() - 1)
                    console.log("1")
                if(timestamp.getMinutes() <= matchDate.getMinutes())
                    console.log("2")
                if(timestamp.getDay() >= matchDate.getDay())
                    console.log("3")

                if((timestamp.getHours() >= matchDate.getHours() - 1) & (timestamp.getMinutes() <= matchDate.getMinutes()) & (timestamp.getDay() >= matchDate.getDay())){
                    def.resolve(false);
                }else{ 
                    def.resolve(true);
                }
            })
        }
    })
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
            console.log(`Zmieniono status ${round.displayName} na ${round.state}`)
            err ? def.reject(err) : def.resolve(round);
        }) 
    }
    
    return def.promise;
}

module.exports = {
    add,
    getRound,
    changeStatus,
    countRunningRound,
    checkIfRoundIsOpen
}