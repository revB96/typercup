const mongoose = require("mongoose");

var userNotificationSchema = new mongoose.Schema({
    user: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
    newRound: {type: Boolean, default: false},
    daySummary: {type: Boolean, default: false},
    closeRound: {type: Boolean, default: false},
    reminder: {type: Boolean, default: false},
});

var UserNotification = mongoose.model('UserNotification', userNotificationSchema);

module.exports = UserNotification;