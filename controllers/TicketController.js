const mongoose = require("mongoose");
const Q = require("q");
const express = require("express");
const Ticket = require("../models/tickets.js");
const { updateUserStats } = require("./UserStatsController.js");
const { checkIfRoundIsOpen } = require("./RoundController.js");

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
    .exec(function (err, tickets) {
      err ? def.reject(err) : def.resolve(tickets);
    });
    return def.promise;
}

function ticketUpdate(ticketId, t1g, t2g) {
  var def = Q.defer();
  const timestamp = Date.now();
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

function add(formData) {
  var def = Q.defer();
  const timestamp = Date.now();
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
  
         def.reject(new Error("Kolejka jest już zamknięta"));

     } else {
        getUserTicketById(match.scheduleId, match.userId).then((result) => {
          if (result == null) {
            ticket.save(function (err, result) {
              if (err) {
                def.reject(err);
                console.log("***");
                console.log("Błąd przy zapisywaniu typów!");
                console.log(`User: ${match.userId.substr(match.userId.length - 4)}`
                );
                console.log("Treść błędu: ");
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
        console.log(ticket.schedule.t1._id);
        userWinTeam = ticket.schedule.t1._id.toString();
      } else if (ticket.t1g < ticket.t2g) {
        console.log("2.2");
        console.log(ticket.schedule.t2._id);
        userWinTeam = ticket.schedule.t2._id.toString();
      }
      
      if ((ticket.t1g == t1g) & (ticket.t2g == t2g)) {
        updateUserStats(ticket.user._id, 3.0);
      } else if (userWinTeam.toString() == winTeam.toString()) {
        updateUserStats(ticket.user._id, 1.5);
      } else {
        updateUserStats(ticket.user._id, 0);
      }
    });
  });
}

module.exports = {
  add,
  getUserTicketsByRound,
  payForTicketsAfterMatch,
  getAllUserTickets
};
