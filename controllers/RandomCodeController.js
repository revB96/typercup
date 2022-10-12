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
                        round:"$_id.round",
                        code:"$code"
                    }
                }
            }
        }
    ])
    .then(randomCodes =>{
        console.log(randomCodes);
        def.resolve(randomCodes);
    })
    return def.promise;
        
}


module.exports = {
    getAll,
}