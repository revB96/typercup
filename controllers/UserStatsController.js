const mongoose = require("mongoose");
const Q = require("q");
const express = require("express");
const UserStats = require("../models/userStats");
const User = require("./UserController")

function add(userId){
    const timestamp = Date.now();

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

function getAll() {
  var def = Q.defer();
  UserStats.find()
    .populate("user", "username")
    .sort({ points: "desc" })
    .exec(function (err, stats) {
      if (err) def.reject(err);
      else {
        var sortStats = stats
        sortStats.sort(function (a, b) {
          if (a.points == b.points) return b.correctScore - a.correctScore;
          else if ((a.points == b.points) & (a.correctScore == b.correctScore)) return b.correctTeam - a.correctTeam;
        });
        def.resolve(sortStats);
      }
    });
  return def.promise;
}

function updateUserStats(userId, points) {
    var def = Q.defer();
    var correctScore = 0, correctTeam = 0, defeat = 0
    if(points == 0)
        defeat = 1
    if(points == 1)
        correctTeam = 1
    if(points == 3)
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
      console.log(userStats)
      err ? def.reject(err) : def.resolve(userStats);
    });
  
    return def.promise;
}

function addQuizToStats(userId, point){
  var def = Q.defer();
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
    addQuizToStats
}