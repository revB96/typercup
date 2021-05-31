const express = require("express");
const router = express.Router();
const passport = require("passport");
const jwt = require("jsonwebtoken");

//Przenieść

function authenticate(req, res, next) {
  const token = req.cookies.access_token;

  if (token === null) return res.redirect("/login");

  jwt.verify(token, process.env.SECRET_TOKEN, (err, user) => {
    if (err) return res.redirect("/login");

    req.user = user;
    next();
  });
}

router.get("/", authenticate, function (req, res, next) {
  res.render("dashboard", {
    title: "Dashboard",
    user: req.user,
    token: req.query.secret_token,
  });
});

router.get("/table", authenticate, function (req, res) {
  res.render("table", {
    title: "Tabela",
  });
});

router.get("/euro", authenticate, function (req, res) {
  res.render("euro", {
    title: "Euro 2021",
  });
});

router.get("/admin", authenticate, function (req, res) {
  res.render("admin", {
    title: "Admin",
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

router.get("/profile", authenticate, function (req, res, next) {
  res.render("profile", {
    title: "Profil",
  });
});

router.get("/quiz", authenticate, function (req, res, next) {
  res.render("quiz", {
    title: "Quiz",
  });
});

module.exports = router;
