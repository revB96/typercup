const mongoose = require("mongoose");
const Q = require("q");
const express = require("express");
const SiteConfiguration = require("../models/siteConfiguration.js");
const Edition = require("../models/editions.js");

function addEdition(formData){
    var def = Q.defer();
    var edition = new Edition({
        name: formData.name,
        prize_pool: formData.pool_price,
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

function setEdition(editionId){
    var def = Q.defer();
    SiteConfiguration.findOneAndUpdate(
        {setting: "current_edition"},
        {
          value: editionId
        },
        {
          new: false,
        }
      ).exec(function (err, userStats) {
        err ? def.reject(err) : def.resolve(edition);
      });
    
      return def.promise;
}

function getAllEditions(){
    var def = Q.defer();
    Edition
        .find()
        .exec(function (err, editions) {
            err ? def.reject(err) : def.resolve(editions);
    });
    return def.promise;
}

function getCurrentEdition(){
    var def = Q.defer();
    SiteConfiguration
        .find({setting:"current_edition"})
        .exec(function (err, edition) {
            err ? def.reject(err) : def.resolve(edition);
    });
    return def.promise;
}

module.exports = {
    setEdition,
    getAllEditions,
    getCurrentEdition,
    addEdition
}