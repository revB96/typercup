const mongoose = require("mongoose");

var knockoutTemplatesSchema = new mongoose.Schema({
    team1result: Number,
    team2result: Number,
    team1group: String,
    team2group: String,
    phase: String,
    updatedAt: Date,
});
var knockoutTemplates = mongoose.model('knockoutTemplate', knockoutTemplatesSchema);

module.exports = knockoutTemplates;