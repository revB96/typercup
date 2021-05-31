const mongoose = require("mongoose");
const Q = require("q");
const express = require("express");
const Quiz = require("../models/quiz.js");
const Question = require("../models/quizQuestions.js");
const {updateUserQuizStatus} = require("./UserController.js");

function addQuestion(formData){
    var def = Q.defer();
    var question = new Question({
        question : formData.question,
        type : formData.questionType,
    })

    question.save((function(err, result){
        if(err){
            def.reject(err)
            console.log("***")
            console.log("Błąd przy dodawaniu pytania do Quizu! Treść błędu: ")
            console.log(err)
            console.log("***")
        }
        else{
            def.resolve(result);
            console.log("***")
            console.log("Dodano nowe pytanie do Quizu: ")
            console.log("***")
        }
    }));
    
    return def.promise;
}

function addAnswer(formData){
    var def = Q.defer();
    Question.findByIdAndUpdate(formData.id,{
        correctAnswer : formData.answer,
    },{
        new:true
    }).exec(function (err, question){
        if(err){
            def.reject(err)
            console.log("***")
            console.log("Błąd przy dodawaniu odpowiedzi do QuizPytania! Treść błędu: ")
            console.log(err)
            console.log("***")
        }else{
            def.resolve(question);
            console.log("***")
            console.log("Dodano nową odpowiedź do QuizPytania: ")
            console.log("***")
        }
    })
    return def.promise;
}

function getAllQuestions(){
    var def = Q.defer();
    Question
        .find()
        .exec(function (err, questions) {
            err ? def.reject(err) : def.resolve(questions);
    });
    return def.promise;
}

function getUserQuiz(userId){
    var def = Q.defer();
    Quiz
        .findOne({user: userId})
        .exec(function (err, quiz) {
            err ? def.reject(err) : def.resolve(quiz);
    });
    return def.promise;
}

function getUserAnswers(userId){
    var def = Q.defer();
    Quiz
        .findOne({user: userId})
        .select("answers")
        .exec(function (err, userAnswers) {
            err ? def.reject(err) : def.resolve(userAnswers);
    });
    return def.promise;
}

function updateUserQuiz(quizId, answers){
    var def = Q.defer();
    const timestamp = Date.now();
    Quiz.findByIdAndUpdate(quizId,{
        answers : answers,
        updatedAt: timestamp
    },{
        new:true
    }).exec(function (err, quiz){
        console.log(err)
        console.log(quiz)
        err ? def.reject(err) : def.resolve(quiz);
    })
    return def.promise;
}

function addUserQuiz(formData){
    var def = Q.defer();
    const timestamp = Date.now();
    var userQuiz = new Quiz({
        user : formData[0].userId,
        type : formData.questionType,
        answers: formData,
        updatedAt : timestamp
    })
    getUserQuiz(formData[0].userId).then(quiz => {
        if(quiz == null){
            updateUserQuizStatus(formData[0].userId, true)
            userQuiz.save(function (err, userQuiz) {
            if(err){
                def.reject(err)
                console.log("***")
                console.log("Błąd przy dodawaniu Quizu ")
                console.log("User: " + formData[0].userId)
                console.log(err)
                console.log("***")
            }else{
                def.resolve(userQuiz);
                console.log("***")
                console.log("Dodano Quiz")
                console.log("User: " + formData[0].userId)
                console.log("***")
            }

        })
        }else{
            updateUserQuiz(quiz._id, formData).then(result=>{
                console.log("***")
                console.log("Zaaktualizowano Quiz")
                console.log("User: " + formData[0].userId)
                console.log("***")
                def.resolve(result);
            })
        }
    })


    return def.promise;
}

function closeQuiz() {
    var def = Q.defer();
    getAllQuestions().then((result) => {
      result.forEach((question) => {
        Question.findByIdAndUpdate(
         question._id,
          {
            closed: true
          },
          {
            new: true,
          }
        ).exec(function (err, round) {
          if(err){
            def.reject(err)
            console.log("***")
            console.log("Błąd przy dodawaniu Quizu ")
            console.log(err)
            console.log("***")
          }else{
            console.log("***")
            console.log("Zamknięto Quiz")
            console.log("***")
            def.resolve("Zamknięto Quiz");
          } 
        });
      });
    });
    return def.promise;
  }

module.exports = {
    addQuestion,
    getAllQuestions,
    addAnswer,
    addUserQuiz,
    getUserAnswers,
    closeQuiz,
}