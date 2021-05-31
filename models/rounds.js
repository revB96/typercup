const mongoose = require("mongoose");

var roundSchema = new mongoose.Schema({
    round: {type: String, unique: true},
    displayName: {type: String, unique: true},
    state: {type: String, default: "unstarted"},
    roundDate: {type: Date, unique: true},
});
var Round = mongoose.model('Round', roundSchema);

module.exports = Round;