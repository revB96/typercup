const mongoose = require("mongoose");

var userStatsSchema = new mongoose.Schema({
    user: {type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true, required: true},
    points: {type: Number, default: 0},
    tickets: {type: Number, default: 0},
    correctScore: {type: Number, default: 0},
    correctTeam: {type: Number, default: 0},
    defeat: {type: Number, default: 0},
    correctQuestions: {type: Number, default: 0},
    quizPoints: {type: Number, default: 0},
    updatedAt: Date
});
var UserStats = mongoose.model('UserStats', userStatsSchema);

module.exports = UserStats;