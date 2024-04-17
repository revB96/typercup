const mongoose = require("mongoose");

var QuizQuestionSchema = new mongoose.Schema({
    question: {type: String, required: true },
    correctAnswer: {type: String, default: ""},
    type: {type: String, required: true },
    dictionary: {type: String},
    closed: {type: Boolean, default: false},
    position: {type: Number, reguired: true}
});
var QuizQuestionSchema = mongoose.model('QuizQuestions', QuizQuestionSchema);

module.exports = QuizQuestionSchema;