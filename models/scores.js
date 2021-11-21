const mongoose = require("mongoose");

var scoreSchema = new mongoose.Schema({
    schedule: {type: mongoose.Schema.Types.ObjectId, ref: "Schedule", unique: true},
    t1g: Number,
    t2g: Number,
});
var Score = mongoose.model('Score', scoreSchema);

module.exports = Score;