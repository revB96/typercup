const mongoose = require("mongoose");
const Q = require("q");
const express = require("express");
const KnockoutTemplate = require("../models/knockoutTemplates.js");
const Schedule = require("../models/schedule.js");
const {getScheduleScore} = require("./ScoreController");
const Team = require("./TeamController");
const moment = require('moment-timezone');

function add(formData){
    var def = Q.defer();
    const timestamp = Date.now();

    var matchDate = formData.matchDate + " " + formData.matchTime
    var matchDateConverted = new Date(matchDate)

    var knockoutTemplate = new KnockoutTemplate({
        stage : formData.stage,
        team1 : formData.team1,
        team1result : formData.team1result,
        team2 : formData.team2,
        team2result : formData.team2result,
        matchDate : moment.tz(matchDateConverted, "Europe/Warsaw"),
        updatedAt: timestamp
    })

    knockoutTemplate.save((function(err, result){
        if(err){
            def.reject(err)
            console.log("Błąd przy dodawaniu template fazy pucharowej! Treść błędu: ")
            console.log(err)
        }
        else{
            def.resolve(result);
            console.log("Dodano nowy template fazy pucharowej")
        }
    }));

    
    return def.promise;
}

function getAll(){
    var def = Q.defer();
    KnockoutTemplate
        .find()
        .exec(function (err, template) {
            err ? def.reject(err) : def.resolve(template);
    });
    return def.promise;    
}

function getTemplateById(templateId){
    var def = Q.defer();
    KnockoutTemplate
        .findOne({_id:templateId})
        .exec(function (err, template) {
            err ? def.reject(err) : def.resolve(template);
    });
    return def.promise;
}

// var scheduleSchema = new mongoose.Schema({
//     t1: {type: mongoose.Schema.Types.ObjectId, ref: "NationalTeam"},
//     t2: {type: mongoose.Schema.Types.ObjectId, ref: "NationalTeam"},
//     group: String Dodać required: false,
//     Dodać tournamentGroup: {type: String, required: false}
//     Dodać Stage: String
//     played: {type: Boolean, default: false},
//     matchDate: Date,
//     createdAt: Date,
//     updatedAt: Date,
// });

function updateUserQuiz(quizId, answers){
    var def = Q.defer();
    const timestamp = Date.now();
    Quiz.findByIdAndUpdate(quizId,{
        answers : answers,
        updatedAt: timestamp
    },{
        new:true
    }).exec(function (err, quiz){
        console.log(err)
        console.log(quiz)
        err ? def.reject(err) : def.resolve(quiz);
    })
    return def.promise;
}


function updateMatchID(id, scheduleID){
    var def = Q.defer();
    const timestamp = Date.now();

    Template.findByIdAndUpdate(id, {
        schedule: scheduleID,
        updatedAt: timestamp
    }).exec(function (err, template){
        err ? def.reject(err) : def.resolve(template);
    })
    return def.promise;
}

function add18matches(){
    getAll().then(templates =>{
        templates.forEach(template =>{
            Team.getGroup(template.team1).then(group1 =>{
                Team.getGroup(template.team2).then(group2 =>{
                    var schedule = new Schedule({
                        t1 : group1[template.team1result]._id,
                        t2 : group2[template.team2result]._id,
                        stage: "1/8",
                        matchDate : template.matchDate,
                        createdAt : moment.tz(timestamp, "Europe/Warsaw"),
                        updatedAt : moment.tz(timestamp, "Europe/Warsaw")
                    })

                    schedule.save(function (err, schedule) {
                        err ? def.reject(err) : def.resolve(schedule);

                        updateMatchID(template._id, result._id).then((err,result) => {
                            err ? console.log(err) : console.log("Poprawnie zaktualizowano MatchID w Templates");
                        })
                    });

                })
            })
        })
    })
}

function getAll18Templates(){
    var def = Q.defer();
    KnockoutTemplate
        .find({stage:"1/8"})
        .exec(function (err, templates) {
            err ? def.reject(err) : def.resolve(templates);
    });

    
    return def.promise;    
}

function add14match(){
    var def = Q.defer();
    getAll18Templates().then(templates => {
        templates.forEach(template =>{
            getScheduleScore(template.schedule).then(schedule => {
                
            })      
        })
    })
}

function addToSchedule(formData){
    var def = Q.defer();
    const timestamp = Date.now();

    switch(formData.stage){
        case "1/8":
            add18matches();
            break;
        case "1/4":
            add14match(formData.templateId);
            break;
        case "1/2":
            add12match(formData.templateId);
            break;
        case "final":
            addFinal(formData.templateId);
            break;
            
    }

}


module.exports = {
    getAll,
}