const mongoose = require("mongoose");
const Q = require("q");
const express = require("express");
const User = require("../models/users");
const bcrypt = require("bcrypt")
const UserStats = require("../controllers/UserStatsController")
const UserNotification = require("../controllers/UserNotificationController")

async function add(formData){
    const timestamp = Date.now();
    var def = Q.defer();

    var hashedPassword = await bcrypt.hash(formData.password, 10)

    var user = new User({
        username : formData.username,
        password : hashedPassword,
        email : formData.email,
        role : formData.role,
        createdAt : timestamp,
        updatedAt : timestamp
    })
    
    user.save((function(err, result){
        if(err){
            def.reject(err)
            console.log(`Bład dodawania użytkownika!`)
            console.log(err)
        }else{
            def.resolve(result);
            console.log(`Dodano nowy nowego użytkownika: ${formData.username}`)
            UserStats.add(result._id)
            UserNotification.add(result._id)
            UserNotification.newAcountEmailNotification(formData.email, formData.username, formData.password)
        }
    
    }));


    return def.promise;
}

function getUserByName(username){
    var def = Q.defer();
    User
        .findOne({username:username})
        .exec(function (err, user) {
            err ? def.reject(err) : def.resolve(user);
    });
    
    return def.promise;
}

function getUserById(id){
    var def = Q.defer();
    User
        .findOne({_id:id})
        .exec(function (err, user) {
            err ? def.reject(err) : def.resolve(user);
    });
    
    return def.promise;
}

function getUserDetails(id){
    var def = Q.defer();
    User
        .findOne({_id:id})
        .populate("userNotifications")
        .select('username email firstLogon filledQuiz userNotifications')
        .exec(function (err, user) {
            err ? def.reject(err) : def.resolve(user);
    });
    
    return def.promise;
}

function updateUserQuizStatus(userId, status){
    const timestamp = Date.now();
    User.findByIdAndUpdate(userId,{
        filledQuiz : status,
        updatedAt: timestamp
    },{
        new:true
    }).exec(function (err, user){
        if(err){
                console.log("***")
                console.log("Błąd podczas zmiany statusu Quizu ");
                console.log(`User: ${userId.substr(userId.length - 4)}`);
                console.log(`Treść błędu: `);
                console.log(err);
                console.log("***")
                def.reject(err)
            }
    })
}

function getAll() {
    var def = Q.defer();
    User
        .find({},"username email role firstLogon filledQuiz createdAt updatedAt")
        .sort({createdAt: "desc"})
        .exec(function (err, users) {
            err ? def.reject(err) : def.resolve(users);
    });
    
    return def.promise;
}

async function changePassword(formData){
    var def = Q.defer();
    const timestamp = Date.now();
    var hashedPassword = await bcrypt.hash(formData.password, 10)
    console.log(formData.password)
    console.log(formData.userId)
    User
        .findByIdAndUpdate(formData.userId, {
            password: hashedPassword,
            updatedAt: timestamp
        },{
            new:true
        }).exec(function (err, user){
            if(err){
                console.log("***")
                console.log("Błąd podczas zmiany hasła ");
                console.log(`User: ${formData.userId.substr(formData.userId.length - 4)}`);
                console.log(`Treść błędu: `);
                console.log(err);
                console.log("***")
                def.reject(err)
            }else{
                console.log("***")
                console.log("Zmiana hasłą ");
                console.log(`User: ${formData.userId.substr(formData.userId.length - 4)}`);
                console.log("***")
                def.resolve(user);
            }
        })
        return def.promise;

}

module.exports = {
    add,
    getAll,
    getUserByName,
    getUserById,
    changePassword,
    getUserDetails,
    updateUserQuizStatus
}