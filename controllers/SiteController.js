const mongoose = require("mongoose");
const Q = require("q");
const express = require("express");
const SiteConfig = require("../models/siteConfig.js");
const Edition = require("../models/editions.js");
const NationalTeam = require("../models/nationalTeams");
const Quiz = require("../models/quiz");
const QuizQuestion = require("../models/quizQuestions");
const QuizCorrectAnswer = require("../models/quizCorrectAnswers");
const randomCode = require("../models/randomCodes");
const Round = require("../models/rounds");
const Schedule = require("../models/schedule");
const Score = require("../models/scores");
const Ticket = require("../models/tickets");
const UserStat = require("../models/userStats");
const {resetAllUserStats} = require("./UserStatsController.js")

// NationalTeam.collection.drop()
// Quiz.collection.drop();
// QuizQuestion.collection.drop();
// QuizCorrectAnswer.collection.drop();
// randomCode.collection.drop();
// Round.collection.drop();
// Schedule.collection.drop();
// Score.collection.drop();
// Ticket.collection.drop();
// UserStat.collection.drop();

function prepareEdition(){
    mongoose.connection.db.listCollections().toArray(function (err, names) {
        for (i = 0; i < names.length; i++) {
            if(names[i].name == "nationalteams") NationalTeam.collection.drop()
            if(names[i].name == "quizzes") Quiz.collection.drop()
            if(names[i].name == "quizquestions") QuizQuestion.collection.drop()
            if(names[i].name == "quizcorrectanswers") QuizCorrectAnswer.collection.drop()
            if(names[i].name == "randomcodes") randomCode.collection.drop()
            if(names[i].name == "rounds") Round.collection.drop()
            if(names[i].name == "schedules") Schedule.collection.drop()
            if(names[i].name == "scores") Score.collection.drop()
            if(names[i].name == "tickets") Ticket.collection.drop()
            if(names[i].name == "userstats") resetAllUserStats();
        }
    })
}


function addEdition(formData){
    var def = Q.defer();
    var edition = new Edition({
        name: formData.name,
        price_pool: formData.price_pool,
        participants: formData.participants,
      });
    
      edition.save(function (err, result) {
        if(err){
            console.log(err);
            def.reject(err);
        }else{
            def.resolve(edition);
            console.log("***")
            console.log("Dodano nową edycje")
            console.log(result)
            console.log("***")
        }

      });
    return def.promise;
}

async function setActiveEdition(formData){
    var def = Q.defer();
    await getAllEditions().then(editions =>{
        editions.forEach(edition =>{
            Edition.findByIdAndUpdate(edition._id,{
                active : false,
            },{
                new:false
            }).exec(function (err, result){
                if(err){
                    console.log("***")
                    console.log("Błąd ustawianiu edycji jako nieaktywna")
                    console.log(err)
                    console.log("***")
                    def.reject(err)
                }
            })
        })
    })

    await Edition.findByIdAndUpdate(formData.id,{
        active : true,
    },{
        new:false
    }).exec(function (err, edition){
        if(err){
            console.log("***")
            console.log("Błąd przy ustawianiu aktualnej edycji")
            console.log(err)
            console.log("***")
            def.reject(err)
        }else{
            console.log("***")
            console.log("Ustawiono nową aktualną edycji")
            console.log(edition)
            console.log("***")
            prepareEdition();
            def.resolve(edition)
        }
    })
    
    return def.promise;
}

function getAllEditions(){
    var def = Q.defer();
    Edition
        .find()
        .sort({name: "desc"})
        .exec(function (err, editions) {
            err ? def.reject(err) : def.resolve(editions);
    });
    return def.promise;
}

function getCurrentEdition(){
    var def = Q.defer();
    Edition
        .findOne({active:true})
        .exec(function (err, edition) {
            err ? def.reject(err) : def.resolve(edition);
    });
    return def.promise;
}

function setTransferedEdition(editionId){
    var def = Q.defer();
    Edition.findByIdAndUpdate(editionId,{
        transfered : true,
    },{
        new:false,
        autoIndex: true
    }).exec(function (err, edition){
        if(err){
            console.log("***")
            console.log("Błąd przy ustawianiu kolejki jako przetransferewanej")
            console.log(err)
            console.log("***")
            def.reject(err)
        }else{
            console.log("***")
            console.log("Ustawiono kolejkę jako przetransferowaną")
            console.log(edition)
            console.log("***")
            def.reject(edition)
        }
    })
    return def.promise;
}

function getSiteConfig(configName) {
    var def = Q.defer();
    SiteConfig.findOne({configName: configName}).exec(function (
      err,
      config
    ) {
      err ? def.reject(err) : def.resolve(config);
    });
    return def.promise;
  }

function getAllSiteConfigs() {
    var def = Q.defer();
    SiteConfig
        .find()
        .sort({configName: "asc"})
        .exec(function (err, result) {
            err ? def.reject(err) : def.resolve(result);
    });
    return def.promise;
  }

function setSiteConfig(formData) {
    var def = Q.defer();
    const timestamp = moment.tz(Date.now(), "Europe/Warsaw")
    SiteConfig.findByIdAndUpdate(
        formData.configName,
      {
        state: formData.state,
        value: formData.value,
        updatedAt: timestamp,
      },
      {
        new: true,
      }
    ).exec(function (err, config) {
      err ? def.reject(err) : def.resolve(config);
    });
    return def.promise;
}

module.exports = {
    setActiveEdition,
    getAllEditions,
    getCurrentEdition,
    addEdition,
    setTransferedEdition,
    getSiteConfig,
    setSiteConfig,
    getAllSiteConfigs
}