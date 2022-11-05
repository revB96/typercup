const express = require("express");
const Q = require("q");
const router = express.Router();
const Team = require("../controllers/TeamController")
const Schedule = require("../controllers/ScheduleController")
const Round = require("../controllers/RoundController")
const User = require("../controllers/UserController")
const Ticket = require("../controllers/TicketController")
const Score = require("../controllers/ScoreController")
const UserStats = require("../controllers/UserStatsController")
const Quiz = require("../controllers/QuizController")
const Backup = require("../controllers/BackupController")
const RandomCode = require("../controllers/RandomCodeController")
const Site = require("../controllers/SiteController")
const History = require("../controllers/HistoryController")

router.post('/admin/schedule/add', function (req, res) {
    //console.log(req.body)
    Schedule.add(req.body)
        .then(data => {
            res.json(data)
        })
        .catch(err => {
            res.json(err)
        });
})


router.get('/schedule/list/', function (req, res) {
    if (typeof req.query.group !== "undefined")
    {
        Schedule.getGroupSchedule(req.query.group)
            .then(data => {
                res.json(data)
            })
            .catch(err => {
                res.json(err)
            });
    }else{
        Schedule.getAll(req.body)
            .then(data => {
                res.json(data)
            })
            .catch(err => {
                res.json(err)
            }); 
    }
})

router.get('/schedule/round', function (req, res) {
    Schedule.getRoundSchedule(req.query.roundDate)
            .then(data => {
                res.json(data)
            })
            .catch(err => {
                res.json(err)
            }); 
})

router.get('/schedule/get18', function (req, res) {
    Schedule.get18()
            .then(data => {
                res.json(data)
            })
            .catch(err => {
                res.json(err)
            }); 
})

router.get('/schedule/get14', function (req, res) {
    Schedule.get14()
            .then(data => {
                res.json(data)
            })
            .catch(err => {
                res.json(err)
            }); 
})

router.get('/schedule/get12', function (req, res) {
    Schedule.get12()
            .then(data => {
                res.json(data)
            })
            .catch(err => {
                res.json(err)
            }); 
})

router.get('/schedule/getFinal', function (req, res) {
    Schedule.getFinal()
            .then(data => {
                res.json(data)
            })
            .catch(err => {
                res.json(err)
            }); 
})

router.get('/schedule/knockout', function (req, res) {
    Round.getKnockoutSchedule(req.query.stage)
            .then(data => {
                //console.log(data)
                res.json(data)
            })
            .catch(err => {
                res.json(err)
            }); 
})

router.get('/round/checkifopen', function (req, res) {
    Ticket.checkIfRoundIsOpen(req.query.userId)
        .then(data => {
            res.json(data)
        })
        .catch(err => {
            res.json(err)
        }); 
           
})

router.post('/admin/teams/add', function (req, res) {
    //console.log(req.body)
    Team.add(req.body)
        .then(data => {
            res.json(data)
        })
        .catch(err => {
            res.json(err)
        });
})

router.get('/teams/list', function (req, res) {
    Team.getAll()
        .then(data => {
            res.json(data)
        })
        .catch(err => {
            res.json(err)
        });
})

router.get('/teams/', function (req, res) {
    if (typeof req.query.group !== "undefined")
    {
        Team.getGroup(req.query.group)
            .then(data => {
                res.json(data)
            })
            .catch(err => {
                res.json(err)
            });
    }
})

router.post('/admin/round/add', function (req, res) {

    Round.add(req.body)
        .then(data => {
            res.json(data)
        })
        .catch(err => {
            res.json(err)
        });
    
})

router.get('/round/get', function (req, res) {
    if(!!req.query.state)
        Round.getRound(req.query.state)
            .then(data => {
                res.json(data)
            })
            .catch(err => {
                res.json(err)
            });
    if(!!req.query.round)
        Round.getRoundByStage(req.query.round)
            .then(data => {
                res.json(data)
            })
            .catch(err => {
                res.json(err)
            });
    
})

router.post('/admin/round/changestatus', function (req, res) {

    Round.changeStatus(req.query.roundId, req.query.status)
        .then(data => {
            res.json(data)
        })
        .catch(err => {
            //console.log(err)
            res.status(409).json(err.message)
        });
    
})

router.get('/admin/user', function (req, res) {
    User.getAll(req.body)
        .then(data => {
            res.json(data)
        })
        .catch(err => {
            res.json(err)
        });
    
})

router.get('/admin/quiz/close', function (req, res) {
    Quiz.closeQuiz()
        .then(data => {
            res.json(data)
        })
        .catch(err => {
            res.status(512).json(err.message)
        });
    
})

router.post('/admin/user/add', function (req, res) {
    //console.log(req.body)
    User.add(req.body)
        .then(data => {
            res.json(data)
        })
        .catch(err => {
            res.json(err)
        });
    
})

router.post('/admin/user/edit', function (req, res) {
    //console.log(req.body)
    User.update(req.body)
        .then(data => {
            res.json(data)
        })
        .catch(err => {
            res.json(err)
        });
    
})

router.post('/admin/user/reset-password', function (req, res) {
    console.log(req.query)
    User.resetPassword(req.query.id)
        .then(data => {
            res.json(data)
        })
        .catch(err => {
            res.json(err)
        });
    
})

router.post('/admin/test/sendRoundNotification', function (req, res) {
    //console.log(req.body)
    User.testRoundEmailNotification()
})

router.post('/user/changepassword', function (req, res) {
    User.changePassword(req.body)
        .then(data => {
            res.json(data)
        })
        .catch(err => {
            res.json(err)
        });
    
})

router.post('/user/change-email', function (req, res) {
    User.updateEmail(req.body)
        .then(data => {
            res.json(data)
        })
        .catch(err => {
            res.json(err)
        });
    
})

router.get('/user/email', function (req, res) {
    User.getUserEmail(req.query.id)
        .then(data => {
            res.json(data)
        })
        .catch(err => {
            res.json(err)
        });
    
})

router.get('/user', function (req, res) {
    User.getUserDetails(req.query.id)
        .then(data => {
            res.json(data)
        })
        .catch(err => {
            res.json(err)
        });
    
})

router.get('/user/timezone', function (req, res) {
    User.getUserTimezone(req.query.userId)
        .then(data => {
            res.json(data)
        })
        .catch(err => {
            res.json(err)
        });
    
})

router.get('/user/tickets', function (req, res) {
    Ticket.getAllUserTickets(req.query.userId)
        .then(data => {
            res.json(data)
        })
        .catch(err => {
            res.json(err)
        });
    
})

router.get('/score/schedule', function (req, res) {
    Score.getScheduleScore(req.query.id)
        .then(data => {
            res.json(data)
        })
        .catch(err => {
            res.json(err)
        });
    
})

router.get('/user-notifications', function (req, res) {
    User.getUserNotifications(req.query.id)
        .then(data => {
            res.json(data)
        })
        .catch(err => {
            res.json(err)
        });
    
})

router.post('/ticket/add', function (req, res) {
    Ticket.add(req.body)
        .then(data => {
            res.json(data)
        })
        .catch(err => {
            //console.log("error")
            res.status(409).json(err.message)
        });
    
})

router.get('/tickets/stats', function (req, res) {
    //console.log(req.query.scheduleId)
    Ticket.getTicketStats(req.query.scheduleId)
        .then(data => {
            res.json(data)
            //console.log(data)
        })
        .catch(err => {
            res.json(err)
        });
})

router.get('/tickets', function (req, res) {
    if((!!req.query.userId)&(!!req.query.round))
        Ticket.getUserTicketsByRound(req.query.userId, req.query.round)
            .then(data => {
                res.json(data)
            })
            .catch(err => {
                res.json(err)
            });
    if(!!req.query.round)
        Ticket.getTicketsByRound(req.query.round)
        .then(data => {
            res.json(data)
        })
        .catch(err => {
            res.json(err)
        });
    
})

router.post('/admin/score/add', function (req, res) {
    Score.add(req.body)
        .then(data => {
            res.json(data)
        })
        .catch(err => {
            res.json(err)
        });
    
})

router.get('/scores', function (req, res) {

  Score.getAll(req.body)
    .then(data => {
        res.json(data)
     })
    .catch(err => {
        res.json(err)
     });
    
})

router.get('/admin/backups', function (req, res) {
    Backup.getBackupsList(req.body)
        .then(data => {
            res.json(data)
        })
        .catch(err => {
            res.json(err)
        });
    
})

router.post('/admin/backups/create', function (req, res) {
    Backup.dumpMongo2Localfile(req.body)
        .then(data => {
            res.json(data)
        })
        .catch(err => {
            res.json(err)
        });
    
})

router.post('/admin/backups/restore', function (req, res) {
    //console.log(req.query.fileName)
    Backup.restoreLocalfile2Mongo(req.query.fileName)
        .then(data => {
	    //console.log(data);
            res.json(data)
        })
        .catch(err => {
	    console.log(err);
            res.json(err)
        });
    
})

router.post('/admin/backups/restoreToBackup', function (req, res) {
    //console.log(req.query.fileName)
    Backup.restoreToBackupDatabase(req.query.fileName)
        .then(data => {
	    //console.log(data);
            res.json(data)
        })
        .catch(err => {
	    //console.log(err);
            res.json(err)
        });
    
})

router.get('/user/table', function (req, res) {
    UserStats.getAll(req.body)
        .then(data => {
            res.json(data)
        })
        .catch(err => {
            res.json(err)
        });
    
})

router.get('/round/last', function (req, res) {
    Round.countFinishedRounds()
        .then(data => {
            res.json(data)
        })
        .catch(err => {
            res.json(err)
        });
    
})

router.get('/round/finished/count', function (req, res) {
    Round.countFinishedRounds()
        .then(data => {
            res.json(data)
        })
        .catch(err => {
            res.json(err)
        });
    
})


router.post('/user/notification/toggle', function (req, res) {
    User.toogleNotification(req.query.name,req.query.userId)
        .then(data => {
            res.json(data)
        })
        .catch(err => {
            res.json(err)
        });
    
})

router.post('/admin/addstats/:id/:points', function (req, res) {
    UserStats.updateUserStats(req.id, req.points)
        .then(data => {
            res.json(data)
        })
        .catch(err => {
            res.json(err)
        });
    
})

router.delete('/admin/teamstats/reset', function (req, res) {
    Team.resetTeamsStats()
})

router.post('/admin/quiz/add', function (req, res) {
    Quiz.addQuestion(req.body)
        .then(data => {
            res.json(data)
        })
        .catch(err => {
            res.json(err)
        });
    
})

router.post('/quiz/add', function (req, res) {
    Quiz.addUserQuiz(req.body)
        .then(data => {
            res.json(data)
        })
        .catch(err => {
            res.json(err)
        });
    
})

router.get('/quiz/questions', function (req, res) {
    Quiz.getAllQuestions()
        .then(data => {
            res.json(data)
        })
        .catch(err => {
            res.json(err)
        });
    
})

router.get('/quiz/answers', function (req, res) {
    Quiz.getUserAnswers(req.query.userId)
        .then(data => {
            res.json(data)
        })
        .catch(err => {
            res.json(err)
        });
    
})

router.get('/quiz/correctAnswers', function (req, res) {
    UserStats.getUserCorrectAnswers(req.query.user)
        .then(data => {
            res.json(data)
        })
        .catch(err => {
            res.json(err)
        });
    
})

router.post('/admin/quiz/answer/add', function (req, res) {
    Quiz.addAnswer(req.body)
        .then(data => {
            res.json(data)
        })
        .catch(err => {
            res.json(err)
        });
    
})

router.get('/admin/quiz/addpoints', function (req, res) {
    Quiz.addQuizPoints()
        .then(data => {
            res.json(data)
        })
        .catch(err => {
            res.json(err)
        });
    
})

router.get('/admin/randomCodes', function (req, res) {
    RandomCode.getAll()
        .then(data => {
            res.json(data)
        })
        .catch(err => {
            res.json(err)
        });
    
})

router.get('/admin/site/edition/get', function (req, res) {
    Site.getAllEditions(req.body)
        .then(data => {
            res.json(data)
        })
        .catch(err => {
            res.json(err)
        });
    
})


router.post('/admin/site/edition/setActive', function (req, res) {
    Site.setActiveEdition(req.body)
        .then(data => {
            res.json(data)
        })
        .catch(err => {
            res.json(err)
        });
    
})

router.post('/admin/site/archive/transfer-current-edition', function (req, res) {
    History.transferToHistory()
        .then(data => {
            res.json(data)
        })
        .catch(err => {
            res.json(err)
        });
    
})

router.get('/archive/get', function (req, res) {
    History.getEditionDetails(req.query.edition)
        .then(data => {
            res.json(data)
        })
        .catch(err => {
            res.json(err)
        });
    
})

router.post('/admin/site/edition/add', function (req, res) {
    Site.addEdition(req.body)
        .then(data => {
            res.json(data)
        })
        .catch(err => {
            res.json(err)
        });
    
})

module.exports = router;