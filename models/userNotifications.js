const mongoose = require("mongoose");

var userNotificationSchema = new mongoose.Schema({
    user: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
    newRound: {type: Boolean, default: true},
    daySummary: {type: Boolean, default: true},
    closeRound: {type: Boolean, default: true},
    reminder: {type: Boolean, default: true},
});

var UserNotification = mongoose.model('UserNotification', userNotificationSchema);

module.exports = UserNotification;