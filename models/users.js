const mongoose = require("mongoose");

var userSchema = new mongoose.Schema({
    username: {type: String, unique: true},
    email: {type: String, unique: true},
    password: String,
    firstLogon: {type: Boolean, default: false},
    filledQuiz: {type: Boolean, default: false},
    timezone: {type: String},
    friendlyName: {type: String},
    role: String,
    createdAt: Date,
    updatedAt: Date,
    lastLogon: Date
});
var User = mongoose.model('User', userSchema);

module.exports = User;