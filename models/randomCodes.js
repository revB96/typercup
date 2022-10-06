const mongoose = require("mongoose");

var randomCodesSchema = new mongoose.Schema({
    user: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
    code: {type: String, unique: true},
    active: {type: Boolean, default: true},
    round: String,
    createdAt: Date,
    updatedAt: Date,
});
var randomCode = mongoose.model('RandomCode', randomCodesSchema);

module.exports = randomCode;