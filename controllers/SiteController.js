const mongoose = require("mongoose");
const Q = require("q");
const express = require("express");
const SiteConfiguration = require("../models/siteConfiguration.js");
const Edition = require("../models/editions.js");

function addEdition(formData){
    var def = Q.defer();
    var edition = new Edition({
        name: formData.name,
        price_pool: formData.price_pool,
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

async function setActiveEdition(formData){
    var def = Q.defer();
    await getAllEditions().then(editions =>{
        editions.forEach(edition =>{
            Edition.findByIdAndUpdate(edition._id,{
                active : false,
            },{
                new:false
            }).exec(function (err, result){
                if(err){
                    console.log("***")
                    console.log("Błąd ustawianiu edycji jako nieaktywna")
                    console.log(err)
                    console.log("***")
                    def.reject(err)
                }
            })
        })
    })

    await Edition.findByIdAndUpdate(formData.id,{
        active : true,
    },{
        new:false
    }).exec(function (err, edition){
        if(err){
            console.log("***")
            console.log("Błąd przy ustawianiu aktualnej edycji")
            console.log(err)
            console.log("***")
            def.reject(err)
        }else{
            console.log("***")
            console.log("Ustawiono nową aktualną edycji")
            console.log(edition)
            console.log("***")
            def.reject(edition)
        }
    })
    
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
    Edition
        .findOne({active:true})
        .exec(function (err, edition) {
            err ? def.reject(err) : def.resolve(edition);
    });
    return def.promise;
}

module.exports = {
    setActiveEdition,
    getAllEditions,
    getCurrentEdition,
    addEdition
}