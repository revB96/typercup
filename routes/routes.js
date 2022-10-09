const express = require("express");
const router = express.Router();
const passport = require("passport");
const jwt = require("jsonwebtoken");
const User = require("../models/users");
const UserController= require("../controllers/UserController")
const Round = require("../controllers/RoundController")
const Ticket = require("../controllers/TicketController")


function authenticate(req, res, next) {
  const token = req.cookies.access_token;

  if (token === null) return res.redirect("/login");

  jwt.verify(token, process.env.SECRET_TOKEN, (err, user) => {
    if (err) return res.redirect("/login");

    req.user = user;
    next();
  });
}

function authenticateAdmin(req, res, next) {
  const token = req.cookies.access_token;

  if (token === null) return res.redirect("/login");

  jwt.verify(token, process.env.SECRET_TOKEN, (err, user) => {
    if(err)res.redirect("/login")
  
    if(user.user.role == "admin"){
      req.user = user;
    }else{
      res.status(401).render("401", {
        title: "Brak dostępu",
      });
    }

    next();
  });
}

router.get("/", authenticate, async function (req, res, next) {
  res.render("dashboard", {
    title: "Dashboard",
    user: req.user,
    token: req.query.secret_token,
    lastRound: 1
  });
})

router.get("/roundSummary", authenticate, async function (req, res, next) {
  
  res.render("roundSummary", {
    title: "Podsumowanie rundy",
    user: req.user,
    token: req.query.secret_token,
    lastRound: 1
  });
})

router.get("/table", authenticate, async function (req, res) {
  res.render("table", {
    title: "Tabela",
    lastRound: 1
  });
});

router.get("/euro", authenticate, async function (req, res) {
  res.render("euro", {
    title: "Euro 2021",
    lastRound: 1
});
})

router.get("/rules", authenticate, async function (req, res) {
  res.render("rules", {
    title: "Regulamin i zasady",
    lastRound: 1
  });
});

router.get("/previousRound", authenticate, async function (req, res) {
  res.render("previousRounds", {
    title: "Poprzednie kolejki",
    lastRound: 1
  });
});

router.get("/admin", authenticateAdmin, async function (req, res) {
  res.render("admin", {
    title: "Admin",
    lastRound: 1
  });
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

      UserController.lastLogonUpdate(user.id)

      if(user.firstLogon == false)
        UserController.loginStateUpdate(user._id)

      if(user.filledQuiz == true)
        return res.redirect("/");
      else
        return res.redirect("/quiz");
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
    lastRound: 1
  });
});

router.get("/quiz", authenticate, async function (req, res, next) {
  res.render("quiz", {
    title: "Quiz",
    lastRound: 1
  });
});

router.post('/', function (req, res) {
  Ticket.addRandomTickets(req.query.randomCode)
      .then(data => {
          res.json(data)
      })
      .catch(err => {
          res.json(err)
      });
  
})


module.exports = router;
