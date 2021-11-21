const mongoose = require("mongoose");

var scheduleSchema = new mongoose.Schema({
    t1: {type: mongoose.Schema.Types.ObjectId, ref: "NationalTeam"},
    t2: {type: mongoose.Schema.Types.ObjectId, ref: "NationalTeam"},
    group: String,
    played: {type: Boolean, default: false},
    matchDate: Date,
    createdAt: Date,
    updatedAt: Date,
});
var Schedule = mongoose.model('Schedule', scheduleSchema);

module.exports = Schedule;