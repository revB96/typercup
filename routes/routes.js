const express = require("express");
const router = express.Router();
const passport = require("passport");
const jwt = require("jsonwebtoken");
const User = require("../models/users");
const UserController= require("../controllers/UserController")
const Round = require("../controllers/RoundController")
const Ticket = require("../controllers/TicketController")
const Site = require("../controllers/SiteController");

function authenticate(req, res, next) {
  const token = req.cookies.access_token;

  if (token === null) return res.redirect("/login");

  jwt.verify(token, process.env.SECRET_TOKEN, (err, user) => {
    if (err) return res.redirect("/login");

    req.user = user;
    next();
  });
}

router.get("/", authenticate, async function (req, res, next) {
  res.render("dashboard", {
    title: "Dashboard",
    user: req.user,
    token: req.query.secret_token,
    lastRound: 1,
    activeEdition: req.cookies.edition,
  });
})

router.get("/roundSummary", authenticate, async function (req, res, next) {
  
  res.render("roundSummary", {
    title: "Podsumowanie rundy",
    user: req.user,
    token: req.query.secret_token,
    activeEdition: req.cookies.edition,
    lastRound: 1
  });
})

router.get("/table", authenticate, async function (req, res) {
  res.render("table", {
    title: "Tabela",
    activeEdition: req.cookies.edition,
    lastRound: 1
  });
});

router.get("/games", authenticate, async function (req, res) {
  res.render("euro", {
    title: req.cookies.edition,
    activeEdition: req.cookies.edition,
    lastRound: 1
});
})

router.get("/rules", authenticate, async function (req, res) {
  res.render("rules", {
    title: "Regulamin i zasady",
    activeEdition: req.cookies.edition,
    lastRound: 1
  });
});

router.get("/previousRound", authenticate, async function (req, res) {
  res.render("previousRounds", {
    title: "Poprzednie kolejki",
    activeEdition: req.cookies.edition,
    lastRound: 1
  });
});

router.get("/admin", authenticate, async function (req, res) {
  const token = req.cookies.access_token;
  jwt.verify(token, process.env.SECRET_TOKEN, (err, result) => {
    if(result.user.role == "admin"){ 
      res.render("admin", {
        title: "Admin",
        activeEdition: req.cookies.edition,
        lastRound: 1
      });
    }else{
      res.send(401);
    }
  })
});

router.post("/login", async (req, res, next) => {
  passport.authenticate('local',
  (err, user, info) => {
    if (err) {
      return next(err);
    }

    if (!user) {
      return res.redirect('/login');
    }

    req.login(user, { session: false }, async (error) => {
      Site.getCurrentEdition().then((edition)=>{
      if (error) return next(error);

      const body = {
        _id: user._id,
        username: user.username,
        role: user.role,
        email: user.email
      };
      const accessToken = jwt.sign({ user: body }, process.env.SECRET_TOKEN, {
        expiresIn: 86400,
      });
      const refreshToken = jwt.sign(
        { user: body },
        process.env.REFRESH_TOKEN,
        { expiresIn: 525600 }
      );

      res.cookie("access_token", accessToken, {
        maxAge: 86400000,
        //httpOnly: true
      });

      res.cookie("refresh_token", refreshToken, {
        maxAge: 86400000,
        //httpOnly: true
      });

      res.cookie('edition', edition.name);

      UserController.lastLogonUpdate(user.id)

      if(user.firstLogon == false)
        UserController.loginStateUpdate(user._id)

      if(user.filledQuiz == true)
        return res.redirect("/");
      else
        return res.redirect("/quiz");
    })
    });

  })(req, res, next);

});

router.get("/login", (req, res) => {
  res.render("login", {
    title: "Zaloguj się",
  });
});

router.get("/logout", (req, res) => {
  res.cookie("access_token", { expires: Date.now() });
  res.cookie("refresh_token", { expires: Date.now() });
  res.redirect("/login");
});

router.get("/progress", authenticate, function (req, res, next) {
  res.render("progress", {
    title: "Postęp prac",
  });
});

router.get("/profile", authenticate, async function (req, res, next) {
  res.render("profile", {
    title: "Profil",
    activeEdition: req.cookies.edition,
    lastRound: 1
  });
});

router.get("/quiz", authenticate, async function (req, res, next) {
  res.render("quiz", {
    title: "Quiz",
    activeEdition: req.cookies.edition,
    lastRound: 1
  });
});

router.get("/quiz-summary", authenticate, async function (req, res, next) {
  res.render("quiz_summary", {
    title: "Podsumowanie Quizu",
    activeEdition: req.cookies.edition,
  });
});

router.get("/hallOfFame", authenticate, async function (req, res, next) {
  res.render("hallOfFame", {
    title: "⭐ HALL OF FAME ⭐",
    activeEdition: req.cookies.edition,
  });
});


router.get('/randomCode', function (req, res) {
  Ticket.addRandomTickets(req.query.code)
      .then(data => {
          res.json(data)
      })
      .catch(err => {
          res.json(err)
      });
})


module.exports = router;
