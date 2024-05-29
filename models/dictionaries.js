const mongoose = require("mongoose");

var dictionarySchema = new mongoose.Schema({
    type: String,
    param1: String,
    param2: String,
});
var DictionarySchema = mongoose.model('dictionary', dictionarySchema);

module.exports = DictionarySchema;