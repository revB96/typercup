const mongoose = require("mongoose");

var ticketSchema = new mongoose.Schema({
    schedule: {type: mongoose.Schema.Types.ObjectId, ref: "Schedule"},
    user: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
    round: String,
    t1g: Number,
    t2g: Number,
    winTeam: String,
    createdAt: Date,
    updatedAt: Date
});

var Ticket = mongoose.model('Ticket', ticketSchema);

module.exports = Ticket;