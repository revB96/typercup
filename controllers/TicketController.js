const mongoose = require("mongoose");
const Q = require("q");
const express = require("express");
const Ticket = require("../models/tickets.js");
const Round = require("../models/rounds.js");
const RandomCode = require("../models/randomCodes.js");
const { updateUserStats } = require("./UserStatsController.js");
const User = require("../models/users.js");
const Schedule = require("./ScheduleController.js");
const moment = require('moment-timezone');
const nodemailer = require("nodemailer");
const {sendNotificationToUser} = require("./UserNotificationController");
const Chance = require('chance');
const { getScheduleById } = require("./ScheduleController.js");

let transporter = nodemailer.createTransport({
  host: "smtp.x999.mikr.dev",
  port: 587,
  secure: false,
  auth: {
    user: "powiadomienia@typer-cup.pl",
    pass: process.env.MAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

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
      t1g: t1g.replace(/ /g, ''),
      t2g: t2g.replace(/ /g, ''),
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

function getUserTimezone2(userID) {
  var def = Q.defer();
  User.findOne({ _id: userID })
    .select("timezone")
    .exec(function (err, user) {
      err ? def.reject(err) : def.resolve(user);
    });

  return def.promise;
}


function checkIfRoundIsOpen(userID){
  var def = Q.defer();
  getUserTimezone2(userID).then(timezone =>{
    
    var userTZ, offsetTZ;
    if(timezone = "UK") {userTZ = "Europe/London"; offsetTZ = 1}
    else {userTZ = "Europe/Warsaw"; offsetTZ = 1}
    
    getRunningRound().then(runningRound => {
        if(!!runningRound){
            Schedule.getFirstRoundMatch(runningRound.roundDate).then(firstMatch => {
                
                var matchDate = new Date(firstMatch[0].matchDate)
        
                var timestamp = new Date(Date.now());

                if(moment.tz(timestamp, userTZ).format() > moment.tz(matchDate.setHours(matchDate.getHours()-offsetTZ), userTZ).format()){
                    def.resolve(false);
                }else{ 
                    def.resolve(true);
                }
            })
        }
    })
  })

  return def.promise;
}

function getUserRandomCode(randomCode){
  var def = Q.defer();
  RandomCode
      .findOne({code:randomCode})
      .exec(function (err, code) {
          err ? def.reject(err) : def.resolve(code);
      });
  return def.promise;
}

function deactivateRandomCode(randomCode) {
  var def = Q.defer();
  const timestamp = moment.tz(Date.now(), "Europe/Warsaw");

    RandomCode.findOneAndUpdate(
      { code: randomCode },
      {
        $set: {
          active: false,
          updatedAt: timestamp,
        },
      },
      {
        new: false,
      }
    ).exec(function (err, code) {
      err ? def.reject(err) : def.resolve(code);
    });

  return def.promise;
}

function deactivateUserRandomCodeByRound(userId, round) {
  var def = Q.defer();
  const timestamp = moment.tz(Date.now(), "Europe/Warsaw");

    RandomCode.findOneAndUpdate(
      { user: userId, round: round },
      {
        $set: {
          active: false,
          updatedAt: timestamp,
        },
      },
      {
        new: false,
      }
    ).exec(function (err, code) {
      err ? def.reject(err) : def.resolve(code);
    });

  return def.promise;
}

function addRandomTickets(randomCode){
  var def = Q.defer();
  const timestamp = moment.tz(Date.now(), "Europe/Warsaw")
  //console.log("Random Code: "+ randomCode)
  getUserRandomCode(randomCode).then(userRandomCode => {
    //console.log("User Random Code: " + userRandomCode)
    if(!!userRandomCode){
      if(userRandomCode.active == true){
      getRunningRound().then(runningRound => {
       // console.log("Running round: " + runningRound)
        if(runningRound.round == userRandomCode.round){
          checkIfRoundIsOpen(userRandomCode.user).then(roundState =>{
            //console.log("Round State: " + roundState)
            if(roundState === true){
              //console.log("IF OK")
              Schedule.getRoundSchedule(runningRound.roundDate).then(schedule =>{
                //console.log("Schedule: " + schedule)
                schedule.forEach(match =>{

                  var chance1 = new Chance();
                  var chance2 = new Chance();
                  var ticket = new Ticket({
                    t1g: chance1.weighted([0, 1, 2, 3, 4, 5, 6], [10, 9.5, 7, 4, 1, 0.5, 0.25]),
                    t2g: chance2.weighted([0, 1, 2, 3, 4, 5, 6], [10, 9.5, 7, 4, 1, 0.5, 0.25]),
                    round: userRandomCode.round,
                    schedule: match._id,
                    user: userRandomCode.user,
                    createdAt: timestamp,
                    updatedAt: timestamp,
                  });

                  ticket.save(function (err, result) {
                    if (err) {
                      def.reject(err);
                      console.log("***");
                      console.log("Błąd przy zapisywaniu typów!");
                      console.log("Treść błędu: ");
                      console.log(err);
                      console.log("***");
                    } else {
                      def.resolve("Dodano losowe typy. Za chwilę otrzymasz potwierdzenie email");
                      console.log("Dodano losowy typ ");
  
                      console.log("***");
                    }
                  });

                })
                sendNotificationToUser(
                  userRandomCode.mailToNotifications, 
                  "Wysłano losowe typy ✔", 
                  "<p>Wysłałeś losowe typy na kolejkę</p><p>Jeżeli to nie ty, to daj znać na grupie messenger</p>",
                  "")
                  
                deactivateRandomCode(randomCode).then((err, deactivatedCode) =>{
                  if(err) { 
                    console.log("Bład przy dezaktywacji kodu jednorazowego: ")
                    console.log(err)
                  }else{
                    console.log("Dezaktywowano kod");
                  }
                })
              })
            }else{
              def.reject("Kolejka jest już zamknięta")
            }
          })
        }
      })
    }else{
      def.reject("Podany kod został już wykorzystany");
    }
    }else{
      def.reject("Podany kod nie istnieje");
    }
  })
  return def.promise;
}

function addOld(formData) {
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
    checkIfRoundIsOpen(match.userId).then((roundState) => {
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
                deactivateUserRandomCodeByRound(match.userId, match.round)
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
                deactivateUserRandomCodeByRound(match.userId, match.round)
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

function valideTicket(matchId){
  var def = Q.defer();
  console.log("validate")
  getScheduleById(matchId).then(match =>{
    console.log(match)
    if(new Date() < new Date(match.matchDate)) {
      var diff = Math.abs(new Date() - new Date(match.matchDate))
      if(diff < 300000 ){ 
        def.resolve(0);
      }else{
        def.resolve(1);
      }
    }else if(new Date() > new Date(match.matchDate)){
      def.resolve(0);
    }
  })
  console.log(def)
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

    valideTicket(ticket.schedule).then(result => {
      console.log(result)
      if (result != 0) {
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
                deactivateUserRandomCodeByRound(match.userId, match.round)
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
                deactivateUserRandomCodeByRound(match.userId, match.round)
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
    .populate("user", "username friendlyName")
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

function getTicketStats(scheduleID){
  //console.log(scheduleID)
  var def = Q.defer();
  Ticket.find({schedule: scheduleID}, function (err, tickets) {
    if(err) def.reject(err);
    if(!!tickets){
      var t1w = 0, t2w = 0, counter = 0, drawn = 0;
      tickets.forEach(ticket =>{
        if(ticket.t1g == ticket.t2g) drawn++;
        if(ticket.t1g > ticket.t2g) t1w++;
        if(ticket.t1g < ticket.t2g) t2w++;
        counter++;
      })
      var t1stats=Number(((t1w/counter)*100).toFixed(1)),
          t2stats=Number(((t2w/counter)*100).toFixed(1)),
          drawnStats=Number(((drawn/counter)*100).toFixed(1));
      var offset = 0.1;

      var sum = Number((t1stats + t2stats + drawnStats).toFixed(1));

      if(t1stats + t2stats + drawnStats > 100.0){
        while(sum > 100.0){
          t1stats = t1stats - offset;
          t2stats = t2stats - offset;
          drawnStats = drawnStats - offset;
          sum = t1stats + t2stats + drawnStats;
        }
      }
      def.resolve({
        t1: t1stats.toFixed(1),
        t2: t2stats.toFixed(1),
        drawn: drawnStats.toFixed(1),
        counter: counter
      })
    }
  });
  return def.promise;
}

function testGetUserTicketBetweenDates(){
  var def = Q.defer();
  var timestamp = Date.now();
  var startDate = new Date(moment.tz(timestamp, "Europe/Warsaw"));
  var endDate = new Date(moment.tz(timestamp, "Europe/Warsaw"));
  startDate.setHours(2, 0,);
  endDate.setHours(23, 59);

  countUserTicketByRound("60bfe193e4a45b138a196179", "2").then(result => { 
    console.log("1.1" + result)
    def.resolve(result);
  })

  return def.promise;
}

function countUserTicketByRound(userId, round){
  var def = Q.defer();
  Ticket.find({ user: userId, round: round })
    .count()
    .exec(function (err, result) {
      err ? def.reject(err) : def.resolve(result);
    });
    return def.promise;
}

module.exports = {
  add,
  getUserTicketsByRound,
  payForTicketsAfterMatch,
  getAllUserTickets,
  getTicketsByRound,
  checkIfRoundIsOpen,
  addRandomTickets,
  getTicketStats,
  testGetUserTicketBetweenDates,
  countUserTicketByRound
};
