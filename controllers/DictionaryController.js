const mongoose = require("mongoose");
const Q = require("q");
const express = require("express");
const Dictionary = require("../models/dictionaries");

function add(formData) {
  var def = Q.defer();
  var entry = new Dictionary({
    type: formData.dictionaryType,
    param1: formData.dictionaryParam1,
    param2: formData.dictionaryParam2,
  });

  entry.save(function (err, result) {
    err ? def.reject(err) : def.resolve(result);
  });

  console.log("Dodano nowy wpis w słowniku");

  return def.promise;
}

function getAll() {
  var def = Q.defer();
  Dictionary.find().exec(function (err, dictionary) {
    err ? def.reject(err) : def.resolve(dictionary);
  });
  return def.promise;
}

function getDictionaryTypes() {
  var def = Q.defer();
  Dictionary.find().sort({type:"asc"}).distinct("type").exec(function (err, data) {
    err ? def.reject(err) : def.resolve(data);
  });
  return def.promise;
}

function getDictionaryByType(type) {
  var def = Q.defer();
  Dictionary.find({ type: type })
    .sort({ param1: "asc" })
    .exec(function (err, data) {
        err ? def.reject(err) : def.resolve(data);
    });
  return def.promise;
}

function getDictionaryByParam1(param1) {
  var def = Q.defer();
  Dictionary.findOne({ param1: param1 }).sort({type:"asc"})
    .exec(function (err, data) {
        err ? def.reject(err) : def.resolve(data);
    });
  return def.promise;
}

module.exports = {
  add,
  getAll,
  getDictionaryByType,
  getDictionaryByParam1,
  getDictionaryTypes
};
