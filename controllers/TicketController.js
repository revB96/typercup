const mongoose = require("mongoose");
const Q = require("q");
const express = require("express");
const Ticket = require("../models/tickets.js");
const Round = require("../models/rounds.js");
const { updateUserStats } = require("./UserStatsController.js");
const Schedule = require("./ScheduleController.js");
const moment = require('moment-timezone');

function getUserTicketById(scheduleId, userId) {
  var def = Q.defer();
  Ticket.findOne({ schedule: scheduleId, user: userId }).exec(function (
    err,
    ticket
  ) {
    err ? def.reject(err) : def.resolve(ticket);
  });
  return def.promise;
}

function getAllUserTickets(userId) {
  var def = Q.defer();
  Ticket.find({ user: userId })
    .populate({
      path: "schedule",
      populate: { path: "t1", select: "teamName" },
    })
    .populate({
      path: "schedule",
      populate: { path: "t2", select: "teamName" },
    })
    .sort({ round: "asc" })
    .collation({locale: "en_US", numericOrdering: true})
    .exec(function (err, tickets) {
      err ? def.reject(err) : def.resolve(tickets);
    });
    return def.promise;
}

function ticketUpdate(ticketId, t1g, t2g) {
  var def = Q.defer();
  const timestamp = moment.tz(Date.now(), "Europe/Warsaw")
  Ticket.findByIdAndUpdate(
    ticketId,
    {
      t1g: t1g,
      t2g: t2g,
      updatedAt: timestamp,
    },
    {
      new: true,
    }
  ).exec(function (err, round) {
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
          Schedule.getFirstRoundMatch(runningRound.roundDate).then(firstMatch => {
              
              var matchDate = new Date(firstMatch[0].matchDate)
       
              var timestamp = new Date(Date.now());

              if(moment.tz(timestamp, "Europe/Warsaw").format() > moment.tz(matchDate.setHours(matchDate.getHours()-1), "Europe/Warsaw").format()){
                  def.resolve(false);
              }else{ 
                  def.resolve(true);
              }
          })
      }
  })
  return def.promise;
}

function add(formData) {
  var def = Q.defer();
  const timestamp = moment.tz(Date.now(), "Europe/Warsaw")
  formData.forEach((match) => {
    var ticket = new Ticket({
      t1g: match.t1g,
      t2g: match.t2g,
      round: match.round,
      schedule: match.scheduleId,
      user: match.userId,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
    checkIfRoundIsOpen().then((roundState) => {
      if (roundState == false) {
  
         def.reject(new Error("Kolejka jest ju?? zamkni??ta"));

     } else {
        getUserTicketById(match.scheduleId, match.userId).then((result) => {
          if (result == null) {
            ticket.save(function (err, result) {
              if (err) {
                def.reject(err);
                console.log("***");
                console.log("B????d przy zapisywaniu typ??w!");
                console.log(`User: ${match.userId.substr(match.userId.length - 4)}`
                );
                console.log("Tre???? b????du: ");
                console.log(err);
                console.log("***");
              } else {
                def.resolve(result);
                console.log("***");
                console.log("Dodano nowy typ ");
                console.log(
                  `User: ${match.scheduleId.substr(
                    match.scheduleId.length - 4
                  )}`
                );
                console.log(
                  `Mecz: ${match.scheduleId.substr(
                    match.scheduleId.length - 4
                  )}`
                );
                console.log("***");
              }
            });
          } else {
            ticketUpdate(result._id, match.t1g, match.t2g).then(
              (ticketUpdateResult) => {
                def.resolve(ticketUpdateResult);
                console.log("***");
                console.log("Aktualizacja typu");
                console.log(
                  `User: ${match.userId.substr(match.userId.length - 4)}`
                );
                console.log("***");
              }
            );
          }
        });
      }
    });
  });
  return def.promise;
}

function getUserTicketsByRound(userId, round) {
  var def = Q.defer();
  Ticket.find({ user: userId, round: round })
    .sort({ round: "asc" })
    .exec(function (err, tickets) {
      err ? def.reject(err) : def.resolve(tickets);
    });

  return def.promise;
}

function getTicketsByRound(round){
  var def = Q.defer();
  Ticket.find({round: round })
    .sort({ round: "asc" })
    .populate({
      path: "schedule",
      populate: { path: "t1" },
    })
    .populate({
      path: "schedule",
      populate: { path: "t2" },
    })
    .populate("user", "username")
    .exec(function (err, tickets) {
      err ? def.reject(err) : def.resolve(tickets);
    });

  return def.promise;
}

function getTicketsBySchedule(scheduleId) {
  var def = Q.defer();
  Ticket.find({ schedule: scheduleId })
    .populate({
      path: "schedule",
      populate: { path: "t1" },
    })
    .populate({
      path: "schedule",
      populate: { path: "t2" },
    })
    .exec(function (err, tickets) {
      err ? def.reject(err) : def.resolve(tickets);
    });

  return def.promise;
}

async function payForTicketsAfterMatch(scheduleId, t1g, t2g, winTeam) {
  await getTicketsBySchedule(scheduleId).then((tickets) => {
    tickets.forEach((ticket) => {
      var userWinTeam = "";
      if (ticket.t1g > ticket.t2g) {
        userWinTeam = ticket.schedule.t1._id.toString();
      } else if (ticket.t1g < ticket.t2g) {
        userWinTeam = ticket.schedule.t2._id.toString();
      }
      
      if ((ticket.t1g == t1g) & (ticket.t2g == t2g)) {
        updateUserStats(ticket.user._id, 3.0);
      } else if ((userWinTeam.toString() == winTeam.toString()) || ((t1g == t2g) & (ticket.t1g == ticket.t2g))) {
        updateUserStats(ticket.user._id, 1.5);
      } else {
        updateUserStats(ticket.user._id, 0.0);
      }
    });
  });
}

module.exports = {
  add,
  getUserTicketsByRound,
  payForTicketsAfterMatch,
  getAllUserTickets,
  getTicketsByRound,
  checkIfRoundIsOpen
};
