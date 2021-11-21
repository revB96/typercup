const mongoose = require("mongoose");

var quizSchema = new mongoose.Schema({
    user: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
    answers: [],
    updatedAt: Date,
});
var QuizSchema = mongoose.model('Quiz', quizSchema);

module.exports = QuizSchema;