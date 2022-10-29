const mongoose = require("mongoose");
const Q = require("q");
const express = require("express");
const Schedule = require("../models/schedule.js");
const moment = require('moment-timezone');

function add(formData){
    const timestamp = Date.now();
    var def = Q.defer();

    var matchDate = formData.matchDate + " " + formData.matchTime
    var matchDateConverted = new Date(matchDate)

    var data = new Schedule({
        t1 : formData.team1,
        t2 : formData.team2,
        matchDate : moment.tz(matchDateConverted, "Europe/Warsaw"),
        group : formData.group,
        stage : formData.stage,
        createdAt : moment.tz(timestamp, "Europe/Warsaw"),
        updatedAt : moment.tz(timestamp, "Europe/Warsaw")
    })

    data.save((function(err, result){
        err ? def.reject(err) : def.resolve(result);
    }));

    console.log("Dodano nowy mecz")

    return def.promise;
}

function getAll() {
    var def = Q.defer();
    Schedule
        .find()
        .populate("t1", "teamName").populate("t2", "teamName")
        .exec(function (err, schedule) {
            err ? def.reject(err) : def.resolve(schedule);
    });
    return def.promise;
}

function getScheduleById(id) {
    var def = Q.defer();
    Schedule
        .findOne({_id:id})
        .populate("t1", "teamName").populate("t2", "teamName")
        .exec(function (err, schedule) {
            err ? def.reject(err) : def.resolve(schedule);
    });
    return def.promise;
}

function getGroupSchedule(group){
    var def = Q.defer();
    Schedule
        .find({group:group, stage: "group"})
        .sort({matchDate: "asc"})
        .populate("t1", "teamName shortcut").populate("t2", "teamName shortcut")
        .exec(function (err, schedule) {
            err ? def.reject(err) : def.resolve(schedule);
    });
    return def.promise;
}

function getRoundSchedule(roundDate){
    var def = Q.defer();
    var startDate = new Date(roundDate)
    var endDate = new Date(roundDate)

    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);
    //console.log(startDate)
    Schedule
        .find({matchDate: {$gte: startDate, $lte: endDate}})
        .sort({matchDate: "asc"})
        .populate("t1", "teamName shortcut").populate("t2", "teamName shortcut")
        .exec(function (err, schedule) {
            //console.log(schedule)
            err ? def.reject(err) : def.resolve(schedule);
    });
    return def.promise;
}

function getFirstRoundMatch(roundDate){

    var def = Q.defer();
    var startDate = new Date(roundDate)
    var endDate = new Date(roundDate)
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);
    Schedule
        .find({matchDate: {$gte: startDate, $lte: endDate}})
        .sort({matchDate: "asc"})
        .limit(1)
        .select("matchDate")
        .exec(function (err, schedule) {
            //console.log(schedule)
            err ? def.reject(err) : def.resolve(schedule);
    });
    return def.promise;
}

function updateScheduleStatus(scheduleId){
    var def = Q.defer();
    const timestamp = Date.now();
    Schedule.findByIdAndUpdate(
        scheduleId,
        {
        played: true,
        updatedAt: moment.tz(timestamp, "Europe/Warsaw"),
        },
        {
        new: true,
        }
    ).exec(function (err, round) {
        err ? def.reject(err) : def.resolve(round);
    });
    return def.promise;
}

function getMatchesBetweenDates(startDate, endDate){
    var def = Q.defer();
    Schedule
            .find({matchDate: {$gte: startDate, $lte: endDate}})
            .sort({matchDate: "asc"})
            .populate("t1", "teamName shortcut").populate("t2", "teamName shortcut")
            .exec(function (err, schedule) {
                //console.log(schedule)
                err ? def.reject(err) : def.resolve(schedule);
        });
    return def.promise;
}

function get18(){
    var def = Q.defer();
    Schedule
            .find({stage:"18"})
            .sort({matchDate: "asc"})
            .populate("t1", "teamName shortcut stage").populate("t2", "teamName shortcut stage")
            .exec(function (err, schedule) {
                //console.log(schedule)
                err ? def.reject(err) : def.resolve(schedule);
        });
    return def.promise;
}

function get14(){
    var def = Q.defer();
    Schedule
            .find({stage:"14"})
            .sort({matchDate: "asc"})
            .populate("t1", "teamName shortcut stage").populate("t2", "teamName shortcut stage")
            .exec(function (err, schedule) {
                //console.log(schedule)
                err ? def.reject(err) : def.resolve(schedule);
        });
    return def.promise;
}

function get12(){
    var def = Q.defer();
    Schedule
            .find({stage:"12"})
            .sort({matchDate: "asc"})
            .populate("t1", "teamName shortcut stage").populate("t2", "teamName shortcut stage")
            .exec(function (err, schedule) {
                //console.log(schedule)
                err ? def.reject(err) : def.resolve(schedule);
        });
    return def.promise;
}

function getFinal(){
    var def = Q.defer();
    Schedule
            .find({stage:"final"})
            .sort({matchDate: "asc"})
            .populate("t1", "teamName shortcut stage").populate("t2", "teamName shortcut stage")
            .exec(function (err, schedule) {
                //console.log(schedule)
                err ? def.reject(err) : def.resolve(schedule);
        });
    return def.promise;
}

module.exports = {
    add,
    getAll,
    getGroupSchedule,
    getRoundSchedule,
    getScheduleById,
    getFirstRoundMatch,
    updateScheduleStatus,
    getMatchesBetweenDates,
    get18,
    get14,
    get12,
    getFinal,
}

