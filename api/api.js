const express = require("express");
const Q = require("q");
const router = express.Router();
const Team = require("../controllers/TeamController");
const Schedule = require("../controllers/ScheduleController");
const Round = require("../controllers/RoundController");
const User = require("../controllers/UserController");
const Ticket = require("../controllers/TicketController");
const Score = require("../controllers/ScoreController");
const UserStats = require("../controllers/UserStatsController");
const Quiz = require("../controllers/QuizController");
const Backup = require("../controllers/BackupController");
const RandomCode = require("../controllers/RandomCodeController");
const Site = require("../controllers/SiteController");
const History = require("../controllers/HistoryController");
const Dictionary = require("../controllers/DictionaryController");
const Regulation = require("../controllers/RegulationController");
const jwt = require("jsonwebtoken");

function authenticate(req, res, next) {
  const token = req.cookies.access_token;

  if (token === null) return res.redirect("/login");

  jwt.verify(token, process.env.SECRET_TOKEN, (err, user) => {
    if (err) return res.send(401);
    req.user = user;
    next();
  });
}

router.post("/admin/schedule/add", authenticate, function (req, res) {
  //console.log(req.body)
  Schedule.add(req.body)
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      res.json(err);
    });
});

router.get("/schedule/list/", authenticate, function (req, res) {
  if (typeof req.query.group !== "undefined") {
    Schedule.getGroupSchedule(req.query.group)
      .then((data) => {
        res.json(data);
      })
      .catch((err) => {
        res.json(err);
      });
  } else {
    Schedule.getAll(req.body)
      .then((data) => {
        res.json(data);
      })
      .catch((err) => {
        res.json(err);
      });
  }
});

router.get("/dictionary", authenticate, function (req, res) {
  if (req.query.type == "all") {
    Dictionary.getAll()
      .then((data) => {
        res.json(data);
      })
      .catch((err) => {
        res.json(err);
      });
  } else {
    Dictionary.getDictionaryByType(req.query.type)
      .then((data) => {
        res.json(data);
      })
      .catch((err) => {
        res.json(err);
      });
  }
});

router.get("/dictionary/type", authenticate, function (req, res) {
  if (req.query.scope == "all") {
    Dictionary.getDictionaryTypes()
      .then((data) => {
        res.json(data);
      })
      .catch((err) => {
        res.json(err);
      });
  }
});

router.get("/regulations", authenticate, function (req, res) {
  Regulation.getSection(req.query.section)
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      res.json(err);
    });
});

router.post("/admin/regulations", authenticate, function (req, res) {
  Regulation.add(req.body)
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      res.json(err);
    });
});

router.post("/admin/dictionary", authenticate, function (req, res) {
  Dictionary.add(req.body)
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      res.json(err);
    });
});

router.get("/schedule/round", authenticate, function (req, res) {
  Schedule.getRoundSchedule(req.query.roundDate)
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      res.json(err);
    });
});

router.get("/schedule/get18", authenticate, function (req, res) {
  Schedule.get18()
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      res.json(err);
    });
});

router.get("/schedule/get14", authenticate, function (req, res) {
  Schedule.get14()
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      res.json(err);
    });
});

router.get("/schedule/get12", authenticate, function (req, res) {
  Schedule.get12()
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      res.json(err);
    });
});

router.get("/schedule/getFinal", authenticate, function (req, res) {
  Schedule.getFinal()
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      res.json(err);
    });
});

router.get("/schedule/knockout", authenticate, function (req, res) {
  Round.getKnockoutSchedule(req.query.stage)
    .then((data) => {
      //console.log(data)
      res.json(data);
    })
    .catch((err) => {
      res.json(err);
    });
});

router.get("/round/checkifopen", authenticate, function (req, res) {
  Ticket.checkIfRoundIsOpen(req.query.userId)
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      res.json(err);
    });
});

router.post("/admin/teams/add", authenticate, function (req, res) {
  //console.log(req.body)
  Team.add(req.body)
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      res.json(err);
    });
});

router.get("/teams/list", authenticate, function (req, res) {
  Team.getAll()
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      res.json(err);
    });
});

router.get("/teams/", authenticate, function (req, res) {
  if (typeof req.query.group !== "undefined") {
    Team.getGroup(req.query.group)
      .then((data) => {
        res.json(data);
      })
      .catch((err) => {
        res.json(err);
      });
  }
});

router.post("/admin/round/add", authenticate, function (req, res) {
  Round.add(req.body)
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      res.json(err);
    });
});

router.get("/round/get", authenticate, function (req, res) {
  if (!!req.query.state)
    Round.getRound(req.query.state)
      .then((data) => {
        res.json(data);
      })
      .catch((err) => {
        res.json(err);
      });
  if (!!req.query.round)
    Round.getRoundByStage(req.query.round)
      .then((data) => {
        res.json(data);
      })
      .catch((err) => {
        res.json(err);
      });
});

router.post("/admin/round/changestatus", authenticate, function (req, res) {
  Round.changeStatus(req.query.roundId, req.query.status)
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      //console.log(err)
      res.status(409).json(err.message);
    });
});

router.get("/admin/user", function (req, res) {
  User.getAll(req.body)
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      res.json(err);
    });
});

router.get("/admin/quiz/close", authenticate, function (req, res) {
  Quiz.closeQuiz()
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      res.status(512).json(err.message);
    });
});

router.post("/admin/user/add", authenticate, function (req, res) {
  //console.log(req.body)
  User.add(req.body)
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      res.json(err);
    });
});

router.post("/admin/user/edit", authenticate, function (req, res) {
  //console.log(req.body)
  User.update(req.body)
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      res.json(err);
    });
});

router.post("/admin/user/reset-password", authenticate, function (req, res) {
  User.resetPassword(req.query.id)
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      res.json(err);
    });
});

router.post(
  "/admin/test/sendRoundNotification",
  authenticate,
  function (req, res) {
    //console.log(req.body)
    User.testRoundEmailNotification();
  }
);

router.post("/user/changepassword", authenticate, function (req, res) {
  User.changePassword(req.body)
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      res.json(err);
    });
});

router.post("/user/change-email", authenticate, function (req, res) {
  User.updateEmail(req.body)
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      res.json(err);
    });
});

router.get("/user/email", authenticate, function (req, res) {
  User.getUserEmail(req.query.id)
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      res.json(err);
    });
});

router.get("/user", authenticate, function (req, res) {
  User.getUserDetails(req.query.id)
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      res.json(err);
    });
});

router.get("/user/timezone", authenticate, function (req, res) {
  User.getUserTimezone(req.query.userId)
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      res.json(err);
    });
});

router.get("/user/tickets", authenticate, function (req, res) {
  Ticket.getAllUserTickets(req.query.userId)
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      res.json(err);
    });
});

router.get("/score/schedule", authenticate, function (req, res) {
  Score.getScheduleScore(req.query.id)
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      res.json(err);
    });
});

router.get("/user-notifications", authenticate, function (req, res) {
  User.getUserNotifications(req.query.id)
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      res.json(err);
    });
});

router.post("/ticket/add", authenticate, function (req, res) {
  Ticket.add(req.body)
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      //console.log("error")
      res.status(409).json(err.message);
    });
});

router.get("/tickets/stats", authenticate, function (req, res) {
  //console.log(req.query.scheduleId)
  Ticket.getTicketStats(req.query.scheduleId)
    .then((data) => {
      res.json(data);
      //console.log(data)
    })
    .catch((err) => {
      res.json(err);
    });
});

router.get("/tickets", authenticate, function (req, res) {
  if (!!req.query.userId & !!req.query.round)
    Ticket.getUserTicketsByRound(req.query.userId, req.query.round)
      .then((data) => {
        res.json(data);
      })
      .catch((err) => {
        res.json(err);
      });
  if (!!req.query.round)
    Ticket.getTicketsByRound(req.query.round)
      .then((data) => {
        res.json(data);
      })
      .catch((err) => {
        //res.json(err)
      });
});

router.post("/admin/score/add", authenticate, function (req, res) {
  Score.add(req.body)
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      res.json(err);
    });
});

router.get("/scores", authenticate, function (req, res) {
  Score.getAll(req.body)
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      res.json(err);
    });
});

router.get("/admin/backups", authenticate, function (req, res) {
  Backup.getBackupsList(req.body)
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      res.json(err);
    });
});

router.post("/admin/backups/create", authenticate, function (req, res) {
  Backup.dumpMongo2Localfile(req.body)
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      res.json(err);
    });
});

router.post("/admin/backups/restore", authenticate, function (req, res) {
  //console.log(req.query.fileName)
  Backup.restoreLocalfile2Mongo(req.query.fileName)
    .then((data) => {
      //console.log(data);
      res.json(data);
    })
    .catch((err) => {
      console.log(err);
      res.json(err);
    });
});

router.post(
  "/admin/backups/restoreToBackup",
  authenticate,
  function (req, res) {
    //console.log(req.query.fileName)
    Backup.restoreToBackupDatabase(req.query.fileName)
      .then((data) => {
        //console.log(data);
        res.json(data);
      })
      .catch((err) => {
        //console.log(err);
        res.json(err);
      });
  }
);

router.get("/user/table", authenticate, function (req, res) {
  UserStats.getAll(req.body)
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      res.json(err);
    });
});

router.get("/user/get-all-usernames", authenticate, function (req, res) {
  User.getAllUsernames(req.body)
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      res.json(err);
    });
});

router.post("/admin/user/reset-stats", authenticate, function (req, res) {
  UserStats.resetUserStats(req.query.id)
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      res.json(err);
    });
});

router.get("/round/last", authenticate, function (req, res) {
  Round.countFinishedRounds()
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      res.json(err);
    });
});

router.get("/round/finished/count", authenticate, function (req, res) {
  Round.countFinishedRounds()
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      res.json(err);
    });
});

router.post("/user/notification/toggle", authenticate, function (req, res) {
  User.toogleNotification(req.query.name, req.query.userId)
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      res.json(err);
    });
});

router.post("/admin/addstats/:id/:points", authenticate, function (req, res) {
  UserStats.updateUserStats(req.id, req.points)
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      res.json(err);
    });
});

router.delete("/admin/teamstats/reset", authenticate, function (req, res) {
  Team.resetTeamsStats();
});

router.post("/admin/quiz/add", function (req, res) {
  Quiz.addQuestion(req.body)
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      res.json(err);
    });
});

router.post("/quiz/add", authenticate, function (req, res) {
  Quiz.addUserQuiz(req.body)
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      res.json(err);
    });
});

router.get("/quiz/questions", authenticate, function (req, res) {
  Quiz.getAllQuestions()
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      res.json(err);
    });
});

router.get("/quiz/answers", authenticate, function (req, res) {
  Quiz.getUserAnswers(req.query.userId)
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      res.json(err);
    });
});

router.get("/quiz/correctAnswers", authenticate, function (req, res) {
  UserStats.getUserCorrectAnswers(req.query.user)
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      res.json(err);
    });
});

router.post("/admin/quiz/answer/add", authenticate, function (req, res) {
  Quiz.addAnswer(req.body)
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      res.json(err);
    });
});

router.get("/admin/quiz/addpoints", authenticate, function (req, res) {
  Quiz.addQuizPoints()
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      res.json(err);
    });
});

router.get("/admin/randomCodes", authenticate, function (req, res) {
  RandomCode.getAll()
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      res.json(err);
    });
});

router.get("/admin/site/edition/get", authenticate, function (req, res) {
  Site.getAllEditions(req.body)
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      res.json(err);
    });
});

router.post("/admin/site/config", authenticate, function (req, res) {
  Site.getSiteConfig(req.query.name)
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      res.json(err);
    });
});

router.post("/admin/site/config/all", authenticate, function (req, res) {
  Site.getAllSiteConfigs()
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      res.json(err);
    });
});


router.get("/edition", authenticate, function (req, res) {
    Site.getCurrentEdition()
      .then((data) => {
        res.json(data);
      })
      .catch((err) => {
        res.json(err);
      });
  });

router.post("/admin/site/edition/setActive", authenticate, function (req, res) {
  Site.setActiveEdition(req.body)
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      res.json(err);
    });
});

router.post(
  "/admin/site/archive/transfer-current-edition",
  authenticate,
  function (req, res) {
    History.transferToHistory()
      .then((data) => {
        res.json(data);
      })
      .catch((err) => {
        res.json(err);
      });
  }
);

router.get("/archive/get", authenticate, function (req, res) {
  History.getEditionDetails(req.query.edition)
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      res.json(err);
    });
});

router.post("/admin/site/edition/add", authenticate, function (req, res) {
  Site.addEdition(req.body)
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      res.json(err);
    });
});

router.get(
  "/admin/test/testGetUserTicketBetweenDates",
  authenticate,
  function (req, res) {
    Ticket.testGetUserTicketBetweenDates()
      .then((data) => {
        res.json(data);
      })
      .catch((err) => {
        res.json(err);
      });
  }
);

module.exports = router;
