const mongoose = require("mongoose");
const Q = require("q");
const express = require("express");
const RandomCode = require("../models/randomCodes.js");

function getAll(){
    var def = Q.defer();

    RandomCode.aggregate([
        {
            $group: {
                _id: {
                    mailToNotifications : "$mailToNotifications",
                    round:"$round"
                },
                code: {$push: "$code",}
            },
            $group:{
                _id:"$mailToNotifications",
                codes:{
                    $push : {
                        round:"$round",
                        active:"$active",
                        updatedAt:"$updatedAt",
                        code:"$code"
                    }
                }
            }
        }
    ])
    .then(randomCodes =>{
        //console.log(randomCodes);
        def.resolve(randomCodes);
    })
    return def.promise;
        
}

function updateEmail(userId, email) {
    var def = Q.defer();
  
    RandomCode.updateMany({ 
        user: userId
    },{
        $set: {
            mailToNotifications: email,
        },
    },{
        new: false,
    }).exec(function (err, code) {
        err ? def.reject(err) : def.resolve(1);
    });
  
    return def.promise;
}

function userRandomCode(userId, round){
    var def = Q.defer();
    RandomCode.findOne({ user: userId, round: round}).exec((err,user_code) => {
        console.log(user_code)
        err ? def.reject(err) : def.resolve(user_code);
      });
    return def.promise;
}

module.exports = {
    getAll,
    updateEmail,
    userRandomCode
}