const mongoose = require("mongoose");
const Q = require("q");
const express = require("express");
const Score = require("../models/scores.js");
const { updateTeamStats } = require("./TeamController.js");
const { getScheduleById } = require("./ScheduleController.js");
const { updateScheduleStatus } = require("./ScheduleController.js");
const { updateUserStats } = require("./UserStatsController.js");
const { payForTicketsAfterMatch } = require("./TicketController.js");
const moment = require('moment-timezone');

async function add(formData){
    const timestamp = moment.tz(Date.now(), "Europe/Warsaw")
    var def = Q.defer();

    var data = new Score({
        t1g : formData.t1g,
        t2g : formData.t2g,
        schedule : formData.schedule,
        createdAt : timestamp,
    })

    await data.save((function(err, score){
        if (err) {
            def.reject(err);
            console.log("***")
            console.log("Błąd przy zapisywaniu wyniku meczu!");
            console.log("Treść błędu: ");
            console.log(err);
            console.log("***")
          } else {
            def.resolve(score);
            console.log("***")
            console.log("Dodano nowy wynik meczu ");
            console.log(`Mecz: ${formData.schedule.substr(score.schedule.length - 4)}`);
            console.log(`T1G: ${formData.t1g}`);
            console.log(`T2G: ${formData.t2g}`);
            console.log("***")
            console.log(formData.schedule)
            getScheduleById(formData.schedule).then(schedule=>{
                if(score.t1g > score.t2g){
                    updateTeamStats(schedule.t1, 3, score.t1g, score.t2g)
                    updateTeamStats(schedule.t2, 0, score.t2g, score.t1g)
                    payForTicketsAfterMatch(schedule._id,score.t1g, score.t2g, schedule.t1._id)
                    updateScheduleStatus(schedule.id)
                }else if(score.t2g > score.t1g){
                    updateTeamStats(schedule.t1, 0, score.t1g, score.t2g)
                    updateTeamStats(schedule.t2, 3, score.t2g, score.t1g)
                    payForTicketsAfterMatch(schedule._id, score.t1g, score.t2g, schedule.t2._id)
                    updateScheduleStatus(schedule.id)
                }else if(score.t2g == score.t1g){
                    updateTeamStats(schedule.t1, 1, score.t1g, score.t2g)
                    updateTeamStats(schedule.t2, 1, score.t2g, score.t1g)
                    payForTicketsAfterMatch(schedule._id, score.t1g, score.t2g, "drawn")
                    updateScheduleStatus(schedule.id)
                }
            })
            
          }
    }));

    return def.promise;
}

function getAll() {
    var def = Q.defer();
    Score
        .find()
        .populate({
            path: "schedule",
            populate: {path: 't1'},  
        })
        .populate({
            path: "schedule",
            populate: {path: 't2'},  
        })
        .sort({matchDate: "asc"})
        .exec(function (err, scores) {
            err ? def.reject(err) : def.resolve(scores);
    });
    return def.promise;
}

function getScoresByDate(roundDate) {
    var def = Q.defer();

    var startDate = new Date(roundDate)
    var endDate = new Date(roundDate)

    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    Score
        .find({matchDate: {$gte: startDate, $lte: endDate}})
        .exec(function (err, scores) {
            err ? def.reject(err) : def.resolve(scores);
    });
    return def.promise;
}

function getScheduleScore(scheduleId){
    var def = Q.defer();
    Score.findOne({ schedule: scheduleId})
        .populate("schedule", "t1 t2")
        .exec(function (err, score) {
            err ? def.reject(err) : def.resolve(score);
            });

  return def.promise;
}

module.exports = {
    add,
    getAll,
    getScheduleScore,
    getScoresByDate
}