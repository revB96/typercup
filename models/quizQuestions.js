const mongoose = require("mongoose");

var QuizQuestionSchema = new mongoose.Schema({
    question: {type: String, required: true },
    correctAnswer: {type: String, default: ""},
    type: {type: String, required: true },
    closed: {type: Boolean, default: false}
});
var QuizQuestionSchema = mongoose.model('QuizQuestions', QuizQuestionSchema);

module.exports = QuizQuestionSchema;