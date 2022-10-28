const mongoose = require("mongoose");
const Q = require("q");
const express = require("express");
const UserStats = require("../models/userStats");
const CorrectAnswer = require("../models/quizCorrectAnswers");
const User = require("./UserController")
const moment = require('moment-timezone');


function add(userId){
   const timestamp = moment.tz(Date.now(), "Europe/Warsaw")

    var userStat = new UserStats({
        user : userId,
        updatedAt : timestamp,
    })

    userStat.save((function(err, result){
        if((err != true)&(err != null))
            console.log("***")
            console.log("Błąd przy dodawaniu usera do tabeli statystyk!");
            console.log("Treść błędu: ");
            console.log(err);
            console.log("***")
    }));
}

function deactivateUser(userId){
  var def = Q.defer();
    UserStats.findOneAndUpdate({user:userId}, {
    active: false
  },{
    new:true,
    autoIndex: true
  }).exec(function (err,result){
    err ? def.reject(err) : def.resolve(1);
    console.log("Dezaktywacja statystyk: "+result)
  })
  return def.promise;
}

function getAll() {
  var def = Q.defer();
  UserStats.find()
    .select({active:true})
    .populate("user", "username friendlyName champion")
    .sort({ points: "desc" })
    .exec(function (err, stats) {
      if (err) def.reject(err);
      else {
        var sortStats = stats
        sortStats.sort(function (a, b) {
          if(a.points>b.points)
            return -1
          else if (a.points<b.points)
            return 1
          else{
            if(a.point == b.point)
              if(a.correctScore > b.correctScore)
                return -1
              else if(a.correctScore < b.correctScore)
                return 1
              else
                if(a.correctTeam < b.correctTeam)
                  return 1
                else if(a.correctTeam > b.correctTeam)
                  return -1
          }
        });
        def.resolve(sortStats);
      }
    });
  return def.promise;
}

function addToCorrectAnswers(userId, questionId){
    var correctAnswer = new CorrectAnswer({
      user : userId,
      question : questionId,
  })
  correctAnswer.save((function(err, result){
    if((err != true)&(err != null))
        console.log("***")
        console.log("Błąd przy dodawaniu prawidłowej odpowiedzi do tabeli Correct Answers!");
        console.log("Treść błędu: ");
        console.log(err);
        console.log("***")
  }));
}

function getUserCorrectAnswers(userId){
  var def = Q.defer();
  CorrectAnswer.find({user:userId})
    .exec(function (err, userCorrectAnswers) {
      if (err) def.reject(err);
      else {
        def.resolve(userCorrectAnswers);
      }
    });
  return def.promise;
}

function updateUserStats(userId, points) {
    var def = Q.defer();
    var correctScore = 0, correctTeam = 0, defeat = 0
    if(points == 0.0)
        defeat = 1
    if(points == 1.5)
        correctTeam = 1
    if(points == 3.0)
        correctScore = 1
    
    UserStats.findOneAndUpdate(
      {user: userId},
      {
        $inc: {
          points: points,
          tickets: 1,
          correctScore: correctScore,
          correctTeam: correctTeam,
          defeat: defeat,
        },
      },
      {
        new: true,
      }
    ).exec(function (err, userStats) {
      err ? def.reject(err) : def.resolve(userStats);
    });
  
    return def.promise;
}

function addQuizToStats(userId, point){
  UserStats.findOneAndUpdate(
    {user: userId},
    {
      $inc: {
        points: point,
        quizPoints: point
      },
    },
    {
      new: true,
    }
  ).exec(function (err, quizPoints) {
    err ? console.log(err) : console.log(quizPoints)
  });
}

module.exports = {
    add,
    getAll,
    updateUserStats,
    addQuizToStats,
    addToCorrectAnswers,
    getUserCorrectAnswers,
    deactivateUser
}