const mongoose = require("mongoose");

var QuizCorrectAnswersSchema = new mongoose.Schema({
    question: {type: mongoose.Schema.Types.ObjectId, ref: "QuizQuestions"},
    user: {type: mongoose.Schema.Types.ObjectId, ref: "User"}
});
var QuizCorrectAnswers = mongoose.model('QuizCorrectAnswer', QuizCorrectAnswersSchema);

module.exports = QuizCorrectAnswers;