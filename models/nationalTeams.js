const mongoose = require("mongoose");

var nationalTeamsSchema = new mongoose.Schema({
    teamName: {type: String, unique: true},
    group: String,
    points: {type: Number, default: 0},
    played: {type: Number, default: 0},
    won: {type: Number, default: 0},
    drawn: {type: Number, default: 0},
    lost: {type: Number, default: 0},
    for: {type: Number, default: 0},
    against: {type: Number, default: 0},
    difference: {type: Number, default: 0},
    shortcut: {type: String, default: ""},
    createdAt: Date,
    updatedAt: Date,
});
var NationalTeam = mongoose.model('NationalTeam', nationalTeamsSchema);

module.exports = NationalTeam;