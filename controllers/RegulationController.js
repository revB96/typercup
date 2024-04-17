const mongoose = require("mongoose");
const Q = require("q");
const express = require("express");
const Regulation = require("../models/regulations");

function add(formData) {
  var def = Q.defer();
  var regulation = new Regulation({
    section: formData.regulationsForm_Rules,
    order: formData.regulationsForm_Order,
    content: formData.regulationsForm_Content,
    color: formData.regulationsForm_Color,
  });

  regulation.save(function (err, result) {
    err ? def.reject(err) : def.resolve(result);
  });

  console.log("Dodano nowy rekord w Zasadach i Regulaminie");

  return def.promise;
}

function getSection(section) {
    var def = Q.defer();
    Regulation.find({ section: section })
      .sort({ order: "asc" })
      .exec(function (err, data) {
          err ? def.reject(err) : def.resolve(data);
      });
    return def.promise;
}


module.exports = {
    add,
    getSection,
  };
  