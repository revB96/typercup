const mongoose = require("mongoose");

var historySchema = new mongoose.Schema({
    user: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
    edition: {type: mongoose.Schema.Types.ObjectId, ref: "Edition"},
    result: Number,
    tickets: Number,
    points: Number,
    pw: Number,
    wd: Number,
    q: Number,
    d: Number,
});
var HistorySchema = mongoose.model('History', historySchema);

module.exports = HistorySchema;