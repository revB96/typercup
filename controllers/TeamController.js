const mongoose = require("mongoose");
const Q = require("q");
const express = require("express");
const Team = require("../models/nationalTeams");

function add(formData) {
  const timestamp = Date.now();
  var def = Q.defer();

  var data = new Team({
    teamName: formData.teamName,
    group: formData.group,
    shortcut: formData.shortcut,
    createdAt: timestamp,
    updatedAt: timestamp,
  });

  data.save(function (err, result) {
    err ? def.reject(err) : def.resolve(result);
  });

  console.log("Dodano reprezentacje");

  return def.promise;
}

function getAll() {
  var def = Q.defer();
  Team.find().exec(function (err, teams) {
    err ? def.reject(err) : def.resolve(teams);
  });
  return def.promise;
}

function getGroup(group) {
  var def = Q.defer();
  Team.find({ group: group })
    .sort({ points: "desc" })
    .exec(function (err, data) {
      err ? def.reject(err) : def.resolve(data);
    });
  return def.promise;
}

function resetTeamsStats() {
  getAll().then((result) => {
    result.forEach((team) => {
      Team.findByIdAndUpdate(
        team._id,
        {
          points: 0,
          played: 0,
          won: 0,
          drawn: 0,
          lost: 0,
          for: 0,
          against: 0,
        },
        {
          new: true,
        }
      ).exec(function (err, round) {
        err ? console.log(err) : console.log(round);
      });
    });
  });
}

function updateTeamStats(teamId, point, forGoal, against) {
  const timestamp = Date.now();
  var def = Q.defer();
  var wonPoint = 0,
    drawnPoint = 0,
    lostPoint = 0;
  if (point == 0) lostPoint++;
  else if (point == 1) drawnPoint++;
  else if (point == 3) wonPoint++;

  Team.findByIdAndUpdate(
    teamId,
    {
      $inc: {
        points: point,
        played: 1,
        won: wonPoint,
        drawn: drawnPoint,
        lost: lostPoint,
        for: forGoal,
        against: against,
      },
    },
    {
      new: true,
    }
  ).exec(function (err, round) {
    err ? def.reject(err) : def.resolve(round);
  });

  return def.promise;
}

module.exports = {
  add,
  getAll,
  getGroup,
  updateTeamStats,
  resetTeamsStats
};
