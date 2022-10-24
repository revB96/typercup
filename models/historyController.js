const mongoose = require("mongoose");

var historyTemplateSchema = new mongoose.Schema({
    user: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
    username: String,
    edition: String,
    tickets: Number,
    points: Number,
    pw: Number,
    wd: Number,
    q: Number,
});
var historyTemplate = mongoose.model('historyTemplate', historyTemplateSchema);

module.exports = historyTemplate;