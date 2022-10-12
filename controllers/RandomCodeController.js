const mongoose = require("mongoose");
const Q = require("q");
const express = require("express");
const RandomCode = require("../models/randomCodes.js");


function getAll(){
    var def = Q.defer();

    RandomCode
        .find()
        .sort({createdAt: "asc"})
        .exec(function (err, randomCodes){
            if(err){
                def.reject(err)
            }else{
                randomCodes.aggregate([
                    {$group: {
                        mail:"$mailToNotifications",
                        round: "$round",
                        code: {$push: "$code"}
                    }}
                ])
                console.log(randomCodes);
                def.resolve(randomCodes);
            }
        })

    return def.promise;

}

module.exports = {
    getAll,
}