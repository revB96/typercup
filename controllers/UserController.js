if(process.env.NODE_ENV !=='production'){
  require('dotenv').config();
}

const mongoose = require("mongoose");
const Q = require("q");
const express = require("express");
const User = require("../models/users");
const RandomCode = require("./RandomCodeController");
const UserNotification = require("../models/userNotifications");
const bcrypt = require("bcrypt");
const UserStats = require("./UserStatsController");
const { getFirstRoundMatch } = require("./ScheduleController");
const moment = require("moment-timezone");
const nodemailer = require("nodemailer");
const dateFormat = require("dateformat");
const Ticket = require("../models/tickets.js");
const Round = require("../models/rounds.js");

let transporter = nodemailer.createTransport({
  host: "smtp.x999.mikr.dev",
  port: 587,
  secure: false,
  auth: {
    user: "powiadomienia@typer-cup.pl",
    pass: process.env.MAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

async function add(formData) {
  const timestamp = Date.now();
  var def = Q.defer();

  var hashedPassword = await bcrypt.hash(formData.password, 10);

  var user = new User({
    username: formData.username,
    password: hashedPassword,
    email: formData.email,
    role: formData.role,
    timezone: formData.timezone,
    friendlyName: formData.friendlyName,
    champion: formData.champion,
    createdAt: timestamp,
    updatedAt: timestamp,
  });

  user.save(function (err, result) {
    if (err) {
      def.reject(err);
      console.log(`Bład dodawania użytkownika!`);
      console.log(err);
    } else {
      def.resolve(result);
      console.log(`Dodano nowy nowego użytkownika: ${formData.username}`);
      UserStats.add(result._id);
      addNotification(result._id);
      newAccountEmailNotification(
        formData.email,
        formData.username,
        formData.password
      );
    }
  });

  return def.promise;
}

function update(formData) {
  var def = Q.defer();
  const timestamp = Date.now();
  var filledQuiz, firstLogon, active, champion;

  if (formData.filledQuiz == null) filledQuiz = false; else filledQuiz = true;
  if (formData.firstLogon == null) firstLogon = false; else firstLogon = true;
  if (formData.active == null) active = false; else active = true;
  if (formData.champion == null) champion = false; else champion = true;

  User.findByIdAndUpdate(formData.userId, {
    username: formData.username,
    email: formData.email,
    timezone: formData.timezone,
    friendlyName: formData.friendlyName,
    champion: champion,
    firstLogon: firstLogon,
    filledQuiz: filledQuiz,
    active: active,
    updatedAt: timestamp,
  }, {
    new: true,
    autoIndex: true
  }).exec(function (err, user) {
    err ? def.reject(err) : def.resolve(1);

    if (user.active == false) {
      UserStats.deactivateUser(user._id)
      UserNotification.findOneAndUpdate({ user: user._id }, {
        newRound: false,
        daySummary: false,
        closeRound: false,
        reminder: false,
      }, {
        new: true,
        autoIndex: true
      }).exec(function (err, result) {
        console.log("Deaktywacja powiadomień: " + result)
      })
    }

    if (user.active == true) {
      UserStats.activateUser(user._id);
      RandomCode.updateEmail(user._id, formData.email).then((err,result)=>{
        if(err) console.log(err)
        else console.log("Status aktualizacji maila w RandomCodes: " + result)
      });
      UserNotification.findOneAndUpdate({ user: user._id }, {
        newRound: true,
        daySummary: true,
        closeRound: true,
        reminder: true,
      }, {
        new: true,
        autoIndex: true
      }).exec(function (err, result) {
        console.log("Aktywacja powiadomień: " + result)
      })
    }

  })

  return def.promise;
}

function updateEmail(formData){
  var def = Q.defer();
  const timestamp = Date.now();

  User.findByIdAndUpdate(formData.userId, {
    email: formData.email,
    updatedAt: timestamp
  }, {
    new: false,
    autoIndex: true
  }).exec(function (err, user) {
    if(err)
      def.reject(err)
    else{
      RandomCode.updateEmail(formData.userId, formData.email)
      def.resolve(1)
    }
  })
  return def.promise;
}

async function resetPassword(userId){
  var def = Q.defer();
  const timestamp = Date.now();
  var hashedPassword = await bcrypt.hash("tajne_haslo", 10);

  User.findByIdAndUpdate(userId, {
    password: hashedPassword,
    updatedAt: timestamp
  }, {
    new: false,
    autoIndex: true
  }).exec(function (err, user) {
    err ? def.reject(err) : def.resolve(1);

    var nameCapitalized = user.username.charAt(0).toUpperCase() + user.username.slice(1);
        
    const dateOptions = {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    var html = `
                    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
                    <html xmlns="http://www.w3.org/1999/xhtml">
                    <head>
                        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                        <meta name="x-apple-disable-message-reformatting" />
                        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
                        <meta name="color-scheme" content="light dark" />
                        <meta name="supported-color-schemes" content="light dark" />
                        <title></title>
                        <style type="text/css" rel="stylesheet" media="all">
                        /* Base ------------------------------ */
                        
                        @import url("https://fonts.googleapis.com/css?family=Nunito+Sans:400,700&display=swap");
                        body {
                        width: 100% !important;
                        height: 100%;
                        margin: 0;
                        -webkit-text-size-adjust: none;
                        }
                        
                        a {
                        color: #3869D4;
                        }
                        
                        a img {
                        border: none;
                        }
                        
                        td {
                        word-break: break-word;
                        }
                        
                        .preheader {
                        display: none !important;
                        visibility: hidden;
                        mso-hide: all;
                        font-size: 1px;
                        line-height: 1px;
                        max-height: 0;
                        max-width: 0;
                        opacity: 0;
                        overflow: hidden;
                        }
                        /* Type ------------------------------ */
                        
                        body,
                        td,
                        th {
                        font-family: "Nunito Sans", Helvetica, Arial, sans-serif;
                        }
                        
                        h1 {
                        margin-top: 0;
                        color: #333333;
                        font-size: 22px;
                        font-weight: bold;
                        text-align: left;
                        }
                        
                        h2 {
                        margin-top: 0;
                        color: #333333;
                        font-size: 16px;
                        font-weight: bold;
                        text-align: left;
                        }
                        
                        h3 {
                        margin-top: 0;
                        color: #333333;
                        font-size: 14px;
                        font-weight: bold;
                        text-align: left;
                        }
                        
                        td,
                        th {
                        font-size: 16px;
                        }
                        
                        p,
                        ul,
                        ol,
                        blockquote {
                        margin: .4em 0 1.1875em;
                        font-size: 16px;
                        line-height: 1.625;
                        }
                        
                        p.sub {
                        font-size: 13px;
                        }
                        /* Utilities ------------------------------ */
                        
                        .align-right {
                        text-align: right;
                        }
                        
                        .align-left {
                        text-align: left;
                        }
                        
                        .align-center {
                        text-align: center;
                        }
                        /* Buttons ------------------------------ */
                        
                        .button {
                        background-color: #3869D4;
                        border-top: 10px solid #3869D4;
                        border-right: 18px solid #3869D4;
                        border-bottom: 10px solid #3869D4;
                        border-left: 18px solid #3869D4;
                        display: inline-block;
                        color: #FFF;
                        text-decoration: none;
                        border-radius: 3px;
                        box-shadow: 0 2px 3px rgba(0, 0, 0, 0.16);
                        -webkit-text-size-adjust: none;
                        box-sizing: border-box;
                        }
                        
                        .button--green {
                        background-color: #22BC66;
                        border-top: 10px solid #22BC66;
                        border-right: 18px solid #22BC66;
                        border-bottom: 10px solid #22BC66;
                        border-left: 18px solid #22BC66;
                        }
                        
                        .button--red {
                        background-color: #FF6136;
                        border-top: 10px solid #FF6136;
                        border-right: 18px solid #FF6136;
                        border-bottom: 10px solid #FF6136;
                        border-left: 18px solid #FF6136;
                        }
                        
                        @media only screen and (max-width: 500px) {
                        .button {
                            width: 100% !important;
                            text-align: center !important;
                        }
                        }
                        /* Attribute list ------------------------------ */
                        
                        .attributes {
                        margin: 0 0 21px;
                        }
                        
                        .attributes_content {
                        background-color: #F4F4F7;
                        padding: 16px;
                        }
                        
                        .attributes_item {
                        padding: 0;
                        }
                        /* Related Items ------------------------------ */
                        
                        .related {
                        width: 100%;
                        margin: 0;
                        padding: 25px 0 0 0;
                        -premailer-width: 100%;
                        -premailer-cellpadding: 0;
                        -premailer-cellspacing: 0;
                        }
                        
                        .related_item {
                        padding: 10px 0;
                        color: #CBCCCF;
                        font-size: 15px;
                        line-height: 18px;
                        }
                        
                        .related_item-title {
                        display: block;
                        margin: .5em 0 0;
                        }
                        
                        .related_item-thumb {
                        display: block;
                        padding-bottom: 10px;
                        }
                        
                        .related_heading {
                        border-top: 1px solid #CBCCCF;
                        text-align: center;
                        padding: 25px 0 10px;
                        }
                        /* Discount Code ------------------------------ */
                        
                        .discount {
                        width: 100%;
                        margin: 0;
                        padding: 24px;
                        -premailer-width: 100%;
                        -premailer-cellpadding: 0;
                        -premailer-cellspacing: 0;
                        background-color: #F4F4F7;
                        border: 2px dashed #CBCCCF;
                        }
                        
                        .discount_heading {
                        text-align: center;
                        }
                        
                        .discount_body {
                        text-align: center;
                        font-size: 15px;
                        }
                        /* Social Icons ------------------------------ */
                        
                        .social {
                        width: auto;
                        }
                        
                        .social td {
                        padding: 0;
                        width: auto;
                        }
                        
                        .social_icon {
                        height: 20px;
                        margin: 0 8px 10px 8px;
                        padding: 0;
                        }
                        /* Data table ------------------------------ */
                        
                        .purchase {
                        width: 100%;
                        margin: 0;
                        padding: 35px 0;
                        -premailer-width: 100%;
                        -premailer-cellpadding: 0;
                        -premailer-cellspacing: 0;
                        }
                        
                        .purchase_content {
                        width: 100%;
                        margin: 0;
                        padding: 25px 0 0 0;
                        -premailer-width: 100%;
                        -premailer-cellpadding: 0;
                        -premailer-cellspacing: 0;
                        }
                        
                        .purchase_item {
                        padding: 10px 0;
                        color: #51545E;
                        font-size: 15px;
                        line-height: 18px;
                        }
                        
                        .purchase_heading {
                        padding-bottom: 8px;
                        border-bottom: 1px solid #EAEAEC;
                        }
                        
                        .purchase_heading p {
                        margin: 0;
                        color: #85878E;
                        font-size: 12px;
                        }
                        
                        .purchase_footer {
                        padding-top: 15px;
                        border-top: 1px solid #EAEAEC;
                        }
                        
                        .purchase_total {
                        margin: 0;
                        text-align: right;
                        font-weight: bold;
                        color: #333333;
                        }
                        
                        .purchase_total--label {
                        padding: 0 15px 0 0;
                        }
                        
                        body {
                        background-color: #F4F4F7;
                        color: #51545E;
                        }
                        
                        p {
                        color: #51545E;
                        }
                        
                        p.sub {
                        color: #6B6E76;
                        }
                        
                        .email-wrapper {
                        width: 100%;
                        margin: 0;
                        padding: 0;
                        -premailer-width: 100%;
                        -premailer-cellpadding: 0;
                        -premailer-cellspacing: 0;
                        background-color: #F4F4F7;
                        }
                        
                        .email-content {
                        width: 100%;
                        margin: 0;
                        padding: 0;
                        -premailer-width: 100%;
                        -premailer-cellpadding: 0;
                        -premailer-cellspacing: 0;
                        }
                        /* Masthead ----------------------- */
                        
                        .email-masthead {
                        padding: 25px 0;
                        text-align: center;
                        }
                        
                        .email-masthead_logo {
                        width: 94px;
                        }
                        
                        .email-masthead_name {
                        font-size: 16px;
                        font-weight: bold;
                        color: #A8AAAF;
                        text-decoration: none;
                        text-shadow: 0 1px 0 white;
                        }
                        /* Body ------------------------------ */
                        
                        .email-body {
                        width: 100%;
                        margin: 0;
                        padding: 0;
                        -premailer-width: 100%;
                        -premailer-cellpadding: 0;
                        -premailer-cellspacing: 0;
                        background-color: #FFFFFF;
                        }
                        
                        .email-body_inner {
                        width: 570px;
                        margin: 0 auto;
                        padding: 0;
                        -premailer-width: 570px;
                        -premailer-cellpadding: 0;
                        -premailer-cellspacing: 0;
                        background-color: #FFFFFF;
                        }
                        
                        .email-footer {
                        width: 570px;
                        margin: 0 auto;
                        padding: 0;
                        -premailer-width: 570px;
                        -premailer-cellpadding: 0;
                        -premailer-cellspacing: 0;
                        text-align: center;
                        }
                        
                        .email-footer p {
                        color: #6B6E76;
                        }
                        
                        .body-action {
                        width: 100%;
                        margin: 30px auto;
                        padding: 0;
                        -premailer-width: 100%;
                        -premailer-cellpadding: 0;
                        -premailer-cellspacing: 0;
                        text-align: center;
                        }
                        
                        .body-sub {
                        margin-top: 25px;
                        padding-top: 25px;
                        border-top: 1px solid #EAEAEC;
                        }
                        
                        .content-cell {
                        padding: 35px;
                        }
                        /*Media Queries ------------------------------ */
                        
                        @media only screen and (max-width: 600px) {
                        .email-body_inner,
                        .email-footer {
                            width: 100% !important;
                        }
                        }
                        
                        @media (prefers-color-scheme: dark) {
                        body,
                        .email-body,
                        .email-body_inner,
                        .email-content,
                        .email-wrapper,
                        .email-masthead,
                        .email-footer {
                            background-color: #333333 !important;
                            color: #FFF !important;
                        }
                        p,
                        ul,
                        ol,
                        blockquote,
                        h1,
                        h2,
                        h3,
                        span,
                        .purchase_item {
                            color: #FFF !important;
                        }
                        .attributes_content,
                        .discount {
                            background-color: #222 !important;
                        }
                        .email-masthead_name {
                            text-shadow: none !important;
                        }
                        }
                        
                        :root {
                        color-scheme: light dark;
                        supported-color-schemes: light dark;
                        }
                        </style>
                        <!--[if mso]>
                        <style type="text/css">
                        .f-fallback  {
                            font-family: Arial, sans-serif;
                        }
                        </style>
                    <![endif]-->
                    </head>
                    <body>
                        <table class="email-wrapper" width="100%" cellpadding="0" cellspacing="0" role="presentation">
                        <tr>
                            <td align="center">
                            <table class="email-content" width="100%" cellpadding="0" cellspacing="0" role="presentation">
                                <tr>
                                <td class="email-masthead">
                                    <a href="https://typer-cup.pl" class="f-fallback email-masthead_name">
                                    TYPER-CUP.PL ⚽
                                </a>
                                </td>
                                </tr>
                                <!-- Email Body -->
                                <tr>
                                <td class="email-body" width="100%" cellpadding="0" cellspacing="0">
                                    <table class="email-body_inner" align="center" width="570" cellpadding="0" cellspacing="0" role="presentation">
                                    <!-- Body content -->
                                    <tr>
                                        <td class="content-cell">
                                        <div class="f-fallback">
                                            <h1>Witaj ${nameCapitalized}!</h1>
                                            <p>Chyba zapomniałeś swoje hasło do Type-Cyp.pl ?</p>
                                            <p>Nie bój nic, mamy nowe</p>
                                            <p>Twoje nowe hasło to: tajne_haslo</p>
                                            <!-- Action -->
                                            <table class="body-action" align="center" width="100%" cellpadding="0" cellspacing="0" role="presentation">
                                                <tr>
                                                <td align="center">
                                                    <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
                                                    <tr>
                                                        <td align="center">
                                                        <a href="https://typer-cup.pl/" class="f-fallback button" target="_blank">Zaloguj się</a>
                                                        </td>
                                                    </tr>
                                                    </table>
                                                </td>
                                                </tr>
                                            </table>
      
                                    <table class="email-footer" align="center" width="570" cellpadding="0" cellspacing="0" role="presentation">
                                    <tr>
                                        <td class="content-cell" align="center">
                                        <p class="f-fallback sub align-center">&copy; 2022 [typer-cup.pl]. All rights reserved.</p>
                                        </td>
                                    </tr>
                                    </table>
                                </td>
                                </tr>
                            </table>
                            </td>
                        </tr>
                        </table>
                    </body>
                    </html>
                    `;
    let mailOptions = {
      from: '"Typer-Cup.pl ⚽ " <powiadomienia@typer-cup.pl>', // sender address
      to: user.email, // list of receivers
      cc: "catch-all@typer-cup.pl",
      subject: "Zrestartowano twoje hasło 🥷", // Subject line
      html: html, // html body
    };

    transporter.sendMail(mailOptions, function (err, data) {
      if (err) console.log("Error " + err + data);
      else{ 
        console.log("Email Sent")}
    });

  })
  return def.promise;
}

async function addAdmin() {
  const timestamp = Date.now();
  var hashedPassword = await bcrypt.hash("0000", 10);
  var user = new User({
    username: "admin",
    password: hashedPassword,
    email: "showpolska@gmail.com",
    role: "admin",
    createdAt: timestamp,
    updatedAt: timestamp,
  });

  user.save(function (err, result) {
    console.log(`Dodano!`);
  });
}

function getUserByName(username) {
  var def = Q.defer();
  User.findOne({ username: username }).exec(function (err, user) {
    err ? def.reject(err) : def.resolve(user);
  });

  return def.promise;
}

function getUserById(id) {
  var def = Q.defer();
  User.findOne({ _id: id }).exec(function (err, user) {
    err ? def.reject(err) : def.resolve(user);
  });

  return def.promise;
}

function getUserDetails(id) {
  var def = Q.defer();
  User.findOne({ _id: id })
    .populate("userNotifications")
    .select("username email firstLogon filledQuiz userNotifications timezone friendlyName champion active")
    .exec(function (err, user) {
      err ? def.reject(err) : def.resolve(user);
    });

  return def.promise;
}

function getUserTimezone(userID) {
  var def = Q.defer();
  User.findOne({ _id: userID })
    .select("timezone")
    .exec(function (err, user) {
      err ? def.reject(err) : def.resolve(user);
    });

  return def.promise;
}


function getUserEmail(userId) {
  var def = Q.defer();
  User.findOne({ _id: userId })
    .select("email")
    .exec(function (err, user) {
      err ? def.reject(err) : def.resolve(user.email);
    });

  return def.promise;
}

function updateUserQuizStatus(userId, status) {
  const timestamp = moment.tz(Date.now(), "Europe/Warsaw");
  User.findByIdAndUpdate(
    userId,
    {
      filledQuiz: status,
      updatedAt: timestamp,
    },
    {
      new: true,
    }
  ).exec(function (err, user) {
    if (err) {
      console.log("***");
      console.log("Błąd podczas zmiany statusu Quizu ");
      console.log(`User: ${userId.substr(userId.length - 4)}`);
      console.log(`Treść błędu: `);
      console.log(err);
      console.log("***");
      def.reject(err);
    }
  });
}

function getAll() {
  var def = Q.defer();
  User.find(
    {},
    "username email role firstLogon filledQuiz createdAt updatedAt lastLogon timezone friendlyName champion active"
  )
    .sort({ active: "desc" })
    .exec(function (err, users) {
      err ? def.reject(err) : def.resolve(users);
    });

  return def.promise;
}

async function changePassword(formData) {
  var def = Q.defer();
  const timestamp = moment.tz(Date.now(), "Europe/Warsaw");
  var hashedPassword = await bcrypt.hash(formData.password, 10);
  console.log(formData.password);
  console.log(formData.userId);
  User.findByIdAndUpdate(
    formData.userId,
    {
      password: hashedPassword,
      updatedAt: timestamp,
    },
    {
      new: true,
    }
  ).exec(function (err, user) {
    if (err) {
      console.log("***");
      console.log("Błąd podczas zmiany hasła ");
      console.log(
        `User: ${formData.userId.substr(formData.userId.length - 4)}`
      );
      console.log(`Treść błędu: `);
      console.log(err);
      console.log("***");
      def.reject(err);
    } else {
      console.log("***");
      console.log("Zmiana hasłą ");
      console.log(
        `User: ${formData.userId.substr(formData.userId.length - 4)}`
      );
      console.log("***");
      def.resolve(user);
    }
  });
  return def.promise;
}

function loginStateUpdate(userId) {
  User.findByIdAndUpdate(
    userId,
    {
      firstLogon: true,
    },
    {
      new: true,
      upsert: true,
    }
  ).exec(function (err, user) {
    if (err) {
      console.log("***");
      console.log("Błąd podczas zmiany statusu firstLogon ");
      console.log(`User: ${userId.substr(userId.length - 4)}`);
      console.log(`Treść błędu: `);
      console.log(err);
      console.log("***");
      def.reject(err);
    }
  });
}

function lastLogonUpdate(userId) {
  const timestamp = moment.tz(Date.now(), "Europe/Warsaw");
  User.findByIdAndUpdate(
    userId,
    {
      lastLogon: timestamp,
    },
    {
      new: true,
      upsert: true,
    }
  ).exec(function (err, user) {
    if (err) {
      console.log("***");
      console.log("Błąd podczas zmiany lastLogon");
      console.log(`User: ${userId.substr(userId.length - 4)}`);
      console.log(`Treść błędu: `);
      console.log(err);
      console.log("***");
      def.reject(err);
    }
  });
}
function testRoundEmailNotification(){
  var timestamp = new Date(Date.now());
  console.log(timestamp)
  roundEmailNotification(timestamp);
}

function getRunningRound() {
  var def = Q.defer();
  Round.findOne({ state: "running" }).exec(function (err, round) {
    err ? def.reject(err) : def.resolve(round);
  });
  return def.promise;
}

function getUserRandomCode(userId) {
  var def = Q.defer();
  console.log("getUserRandomCode #1")
  getRunningRound().then(round => {
    console.log("getUserRandomCode #2")
    RandomCode.userRandomCode(userId, round.round).then((err,code) =>{
      console.log("getUserRandomCode #3")
      console.log("kod: " + code)
      err ? def.reject(err) : def.resolve(code);
      
    })
  })
  return def.promise;
}

//USER NOTIFICATIONS
function newAccountEmailNotification(reciver, username, password) {
  const nameCapitalized = username.charAt(0).toUpperCase() + username.slice(1);

  let html = `
      <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
      <html xmlns="http://www.w3.org/1999/xhtml">
      <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta name="x-apple-disable-message-reformatting" />
          <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
          <meta name="color-scheme" content="light dark" />
          <meta name="supported-color-schemes" content="light dark" />
          <title></title>
          <style type="text/css" rel="stylesheet" media="all">
          /* Base ------------------------------ */
          
          @import url("https://fonts.googleapis.com/css?family=Nunito+Sans:400,700&display=swap");
          body {
          width: 100% !important;
          height: 100%;
          margin: 0;
          -webkit-text-size-adjust: none;
          }
          
          a {
          color: #3869D4;
          }
          
          a img {
          border: none;
          }
          
          td {
          word-break: break-word;
          }
          
          .preheader {
          display: none !important;
          visibility: hidden;
          mso-hide: all;
          font-size: 1px;
          line-height: 1px;
          max-height: 0;
          max-width: 0;
          opacity: 0;
          overflow: hidden;
          }
          /* Type ------------------------------ */
          
          body,
          td,
          th {
          font-family: "Nunito Sans", Helvetica, Arial, sans-serif;
          }
          
          h1 {
          margin-top: 0;
          color: #333333;
          font-size: 22px;
          font-weight: bold;
          text-align: left;
          }
          
          h2 {
          margin-top: 0;
          color: #333333;
          font-size: 16px;
          font-weight: bold;
          text-align: left;
          }
          
          h3 {
          margin-top: 0;
          color: #333333;
          font-size: 14px;
          font-weight: bold;
          text-align: left;
          }
          
          td,
          th {
          font-size: 16px;
          }
          
          p,
          ul,
          ol,
          blockquote {
          margin: .4em 0 1.1875em;
          font-size: 16px;
          line-height: 1.625;
          }
          
          p.sub {
          font-size: 13px;
          }
          /* Utilities ------------------------------ */
          
          .align-right {
          text-align: right;
          }
          
          .align-left {
          text-align: left;
          }
          
          .align-center {
          text-align: center;
          }
          /* Buttons ------------------------------ */
          
          .button {
          background-color: #3869D4;
          border-top: 10px solid #3869D4;
          border-right: 18px solid #3869D4;
          border-bottom: 10px solid #3869D4;
          border-left: 18px solid #3869D4;
          display: inline-block;
          color: #FFF;
          text-decoration: none;
          border-radius: 3px;
          box-shadow: 0 2px 3px rgba(0, 0, 0, 0.16);
          -webkit-text-size-adjust: none;
          box-sizing: border-box;
          }
          
          .button--green {
          background-color: #22BC66;
          border-top: 10px solid #22BC66;
          border-right: 18px solid #22BC66;
          border-bottom: 10px solid #22BC66;
          border-left: 18px solid #22BC66;
          }
          
          .button--red {
          background-color: #FF6136;
          border-top: 10px solid #FF6136;
          border-right: 18px solid #FF6136;
          border-bottom: 10px solid #FF6136;
          border-left: 18px solid #FF6136;
          }
          
          @media only screen and (max-width: 500px) {
          .button {
              width: 100% !important;
              text-align: center !important;
          }
          }
          /* Attribute list ------------------------------ */
          
          .attributes {
          margin: 0 0 21px;
          }
          
          .attributes_content {
          background-color: #F4F4F7;
          padding: 16px;
          }
          
          .attributes_item {
          padding: 0;
          }
          /* Related Items ------------------------------ */
          
          .related {
          width: 100%;
          margin: 0;
          padding: 25px 0 0 0;
          -premailer-width: 100%;
          -premailer-cellpadding: 0;
          -premailer-cellspacing: 0;
          }
          
          .related_item {
          padding: 10px 0;
          color: #CBCCCF;
          font-size: 15px;
          line-height: 18px;
          }
          
          .related_item-title {
          display: block;
          margin: .5em 0 0;
          }
          
          .related_item-thumb {
          display: block;
          padding-bottom: 10px;
          }
          
          .related_heading {
          border-top: 1px solid #CBCCCF;
          text-align: center;
          padding: 25px 0 10px;
          }
          /* Discount Code ------------------------------ */
          
          .discount {
          width: 100%;
          margin: 0;
          padding: 24px;
          -premailer-width: 100%;
          -premailer-cellpadding: 0;
          -premailer-cellspacing: 0;
          background-color: #F4F4F7;
          border: 2px dashed #CBCCCF;
          }
          
          .discount_heading {
          text-align: center;
          }
          
          .discount_body {
          text-align: center;
          font-size: 15px;
          }
          /* Social Icons ------------------------------ */
          
          .social {
          width: auto;
          }
          
          .social td {
          padding: 0;
          width: auto;
          }
          
          .social_icon {
          height: 20px;
          margin: 0 8px 10px 8px;
          padding: 0;
          }
          /* Data table ------------------------------ */
          
          .purchase {
          width: 100%;
          margin: 0;
          padding: 35px 0;
          -premailer-width: 100%;
          -premailer-cellpadding: 0;
          -premailer-cellspacing: 0;
          }
          
          .purchase_content {
          width: 100%;
          margin: 0;
          padding: 25px 0 0 0;
          -premailer-width: 100%;
          -premailer-cellpadding: 0;
          -premailer-cellspacing: 0;
          }
          
          .purchase_item {
          padding: 10px 0;
          color: #51545E;
          font-size: 15px;
          line-height: 18px;
          }
          
          .purchase_heading {
          padding-bottom: 8px;
          border-bottom: 1px solid #EAEAEC;
          }
          
          .purchase_heading p {
          margin: 0;
          color: #85878E;
          font-size: 12px;
          }
          
          .purchase_footer {
          padding-top: 15px;
          border-top: 1px solid #EAEAEC;
          }
          
          .purchase_total {
          margin: 0;
          text-align: right;
          font-weight: bold;
          color: #333333;
          }
          
          .purchase_total--label {
          padding: 0 15px 0 0;
          }
          
          body {
          background-color: #F4F4F7;
          color: #51545E;
          }
          
          p {
          color: #51545E;
          }
          
          p.sub {
          color: #6B6E76;
          }
          
          .email-wrapper {
          width: 100%;
          margin: 0;
          padding: 0;
          -premailer-width: 100%;
          -premailer-cellpadding: 0;
          -premailer-cellspacing: 0;
          background-color: #F4F4F7;
          }
          
          .email-content {
          width: 100%;
          margin: 0;
          padding: 0;
          -premailer-width: 100%;
          -premailer-cellpadding: 0;
          -premailer-cellspacing: 0;
          }
          /* Masthead ----------------------- */
          
          .email-masthead {
          padding: 25px 0;
          text-align: center;
          }
          
          .email-masthead_logo {
          width: 94px;
          }
          
          .email-masthead_name {
          font-size: 16px;
          font-weight: bold;
          color: #A8AAAF;
          text-decoration: none;
          text-shadow: 0 1px 0 white;
          }
          /* Body ------------------------------ */
          
          .email-body {
          width: 100%;
          margin: 0;
          padding: 0;
          -premailer-width: 100%;
          -premailer-cellpadding: 0;
          -premailer-cellspacing: 0;
          background-color: #FFFFFF;
          }
          
          .email-body_inner {
          width: 570px;
          margin: 0 auto;
          padding: 0;
          -premailer-width: 570px;
          -premailer-cellpadding: 0;
          -premailer-cellspacing: 0;
          background-color: #FFFFFF;
          }
          
          .email-footer {
          width: 570px;
          margin: 0 auto;
          padding: 0;
          -premailer-width: 570px;
          -premailer-cellpadding: 0;
          -premailer-cellspacing: 0;
          text-align: center;
          }
          
          .email-footer p {
          color: #6B6E76;
          }
          
          .body-action {
          width: 100%;
          margin: 30px auto;
          padding: 0;
          -premailer-width: 100%;
          -premailer-cellpadding: 0;
          -premailer-cellspacing: 0;
          text-align: center;
          }
          
          .body-sub {
          margin-top: 25px;
          padding-top: 25px;
          border-top: 1px solid #EAEAEC;
          }
          
          .content-cell {
          padding: 35px;
          }
          /*Media Queries ------------------------------ */
          
          @media only screen and (max-width: 600px) {
          .email-body_inner,
          .email-footer {
              width: 100% !important;
          }
          }
          
          @media (prefers-color-scheme: dark) {
          body,
          .email-body,
          .email-body_inner,
          .email-content,
          .email-wrapper,
          .email-masthead,
          .email-footer {
              background-color: #333333 !important;
              color: #FFF !important;
          }
          p,
          ul,
          ol,
          blockquote,
          h1,
          h2,
          h3,
          span,
          .purchase_item {
              color: #FFF !important;
          }
          .attributes_content,
          .discount {
              background-color: #222 !important;
          }
          .email-masthead_name {
              text-shadow: none !important;
          }
          }
          
          :root {
          color-scheme: light dark;
          supported-color-schemes: light dark;
          }
          </style>
          <!--[if mso]>
          <style type="text/css">
          .f-fallback  {
              font-family: Arial, sans-serif;
          }
          </style>
      <![endif]-->
      </head>
      <body>
          <span class="preheader">Twoje konto jest już gotowe</span>
          <table class="email-wrapper" width="100%" cellpadding="0" cellspacing="0" role="presentation">
          <tr>
              <td align="center">
              <table class="email-content" width="100%" cellpadding="0" cellspacing="0" role="presentation">
                  <tr>
                  <td class="email-masthead">
                      <a href="https://typer-cup.pl" class="f-fallback email-masthead_name">
                      TYPER-CUP.PL ⚽
                  </a>
                  </td>
                  </tr>
                  <!-- Email Body -->
                  <tr>
                  <td class="email-body" width="100%" cellpadding="0" cellspacing="0">
                      <table class="email-body_inner" align="center" width="570" cellpadding="0" cellspacing="0" role="presentation">
                      <!-- Body content -->
                      <tr>
                          <td class="content-cell">
                          <div class="f-fallback">
                              <h1>Witaj ${nameCapitalized}!</h1>
                              <p>Twoje konto jest jest już gotowe.</p>
                              <table class="attributes" width="100%" cellpadding="0" cellspacing="0" role="presentation">
                              <tr>
                                  <td class="attributes_content">
                                  <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                                      <tr>
                                      <td class="attributes_item">
                                          <span class="f-fallback">
                  <strong>Login:</strong> ${username}
                  </span>
                                      </td>
                                      </tr>
                                      <tr>
                                      <td class="attributes_item">
                                          <span class="f-fallback">
                  <strong>Hasło startowe:</strong> ${password} <small>(Zmień na jakieś lepsze po zalogowaniu się 👽)</small>
                  </span>
                                      </td>
                                      </tr>
                                  </table>
                                  </td>
                              </tr>
                              </table>
                              <!-- Action -->
                              <table class="body-action" align="center" width="100%" cellpadding="0" cellspacing="0" role="presentation">
                                  <tr>
                                  <td align="center">
                                      <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
                                      <tr>
                                          <td align="center">
                                          <a href="https://typer-cup.pl/" class="f-fallback button" target="_blank">Zaloguj się</a>
                                          </td>
                                      </tr>
                                      </table>
                                  </td>
                                  </tr>
                              </table>
                               
                      <table class="email-footer" align="center" width="570" cellpadding="0" cellspacing="0" role="presentation">
                      <tr>
                          <td class="content-cell" align="center">
                          <p class="f-fallback sub align-center">&copy; 2021 [typer-cup.pl]. All rights reserved.</p>
                          </td>
                      </tr>
                      </table>
                  </td>
                  </tr>
              </table>
              </td>
          </tr>
          </table>
      </body>
      </html>
      `;
  let text = `
      ******************
      Witaj ${nameCapitalized}!
      ******************
  
      Twoje konto jest już gotowe
      Dane
      Login: ${username}
      Hasło startowe: ${username}
  
      Zmień hasło na jakieś lepsze, po zalogowaniu się 👽
      Podczas pierwszego logowania, zostaniesz poproszony o wypełnienie Quizu początkowego. Składa się on z 20 pytań, które dotycza nadchodzącego Euro 2020
      
      © 2022 [typer-cup.pl]. All rights reserved.
      `;
  let mailOptions = {
    from: '"Typer-Cup.pl ⚽ " <admin@typer-cup.pl>', // sender address
    to: reciver, // list of receivers
    subject: "Witaj w typer-cup.pl ✔", // Subject line
    html: html, // html body
    text: text,
  };

  transporter.sendMail(mailOptions, function (err, data) {
    if (err) {
      console.log("Mail: " + err);
    } else {
      console.log("Email sent successfully");
    }
  });
}

function roundEmailNotification(firstMatch) {
  var index = 5;
 
  UserNotification.find({ newRound: true }).exec(function (
    err,
    userNotifications
  ) {
    if (err) console.log(err);
    else {
      
        userNotifications.forEach(async (userNotification) => {
          console.log("0")
          setTimeout(async () => {
          await getUserById(userNotification.user).then(user => {
            var endDate = new Date(firstMatch);
            if(!!user){
            if(user.timezone == "UK") endDate.setHours(endDate.getHours() - 2); else endDate.setHours(endDate.getHours() - 1);
           
            endDate = dateFormat(endDate, "yyyy-mm-dd HH:MM");
            console.log(user._id)
            getUserRandomCode(user._id).then((randomCode) => {
            console.log("2")
            console.log(randomCode)
            if(typeof randomCode.code == "undefined")
              randomCode.code="brak";
            
              var nameCapitalized = user.username.charAt(0).toUpperCase() + user.username.slice(1);
            
              const dateOptions = {
                year: "numeric",
                month: "numeric",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              };
              var html = `
                              <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
                              <html xmlns="http://www.w3.org/1999/xhtml">
                              <head>
                                  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                                  <meta name="x-apple-disable-message-reformatting" />
                                  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
                                  <meta name="color-scheme" content="light dark" />
                                  <meta name="supported-color-schemes" content="light dark" />
                                  <title></title>
                                  <style type="text/css" rel="stylesheet" media="all">
                                  /* Base ------------------------------ */
                                  
                                  @import url("https://fonts.googleapis.com/css?family=Nunito+Sans:400,700&display=swap");
                                  body {
                                  width: 100% !important;
                                  height: 100%;
                                  margin: 0;
                                  -webkit-text-size-adjust: none;
                                  }
                                  
                                  a {
                                  color: #3869D4;
                                  }
                                  
                                  a img {
                                  border: none;
                                  }
                                  
                                  td {
                                  word-break: break-word;
                                  }
                                  
                                  .preheader {
                                  display: none !important;
                                  visibility: hidden;
                                  mso-hide: all;
                                  font-size: 1px;
                                  line-height: 1px;
                                  max-height: 0;
                                  max-width: 0;
                                  opacity: 0;
                                  overflow: hidden;
                                  }
                                  /* Type ------------------------------ */
                                  
                                  body,
                                  td,
                                  th {
                                  font-family: "Nunito Sans", Helvetica, Arial, sans-serif;
                                  }
                                  
                                  h1 {
                                  margin-top: 0;
                                  color: #333333;
                                  font-size: 22px;
                                  font-weight: bold;
                                  text-align: left;
                                  }
                                  
                                  h2 {
                                  margin-top: 0;
                                  color: #333333;
                                  font-size: 16px;
                                  font-weight: bold;
                                  text-align: left;
                                  }
                                  
                                  h3 {
                                  margin-top: 0;
                                  color: #333333;
                                  font-size: 14px;
                                  font-weight: bold;
                                  text-align: left;
                                  }
                                  
                                  td,
                                  th {
                                  font-size: 16px;
                                  }
                                  
                                  p,
                                  ul,
                                  ol,
                                  blockquote {
                                  margin: .4em 0 1.1875em;
                                  font-size: 16px;
                                  line-height: 1.625;
                                  }
                                  
                                  p.sub {
                                  font-size: 13px;
                                  }
                                  /* Utilities ------------------------------ */
                                  
                                  .align-right {
                                  text-align: right;
                                  }
                                  
                                  .align-left {
                                  text-align: left;
                                  }
                                  
                                  .align-center {
                                  text-align: center;
                                  }
                                  /* Buttons ------------------------------ */
                                  
                                  .button {
                                  background-color: #3869D4;
                                  border-top: 10px solid #3869D4;
                                  border-right: 18px solid #3869D4;
                                  border-bottom: 10px solid #3869D4;
                                  border-left: 18px solid #3869D4;
                                  display: inline-block;
                                  color: #FFF;
                                  text-decoration: none;
                                  border-radius: 3px;
                                  box-shadow: 0 2px 3px rgba(0, 0, 0, 0.16);
                                  -webkit-text-size-adjust: none;
                                  box-sizing: border-box;
                                  }
                                  
                                  .button--green {
                                  background-color: #22BC66;
                                  border-top: 10px solid #22BC66;
                                  border-right: 18px solid #22BC66;
                                  border-bottom: 10px solid #22BC66;
                                  border-left: 18px solid #22BC66;
                                  }
                                  
                                  .button--red {
                                  background-color: #FF6136;
                                  border-top: 10px solid #FF6136;
                                  border-right: 18px solid #FF6136;
                                  border-bottom: 10px solid #FF6136;
                                  border-left: 18px solid #FF6136;
                                  }
                                  
                                  @media only screen and (max-width: 500px) {
                                  .button {
                                      width: 100% !important;
                                      text-align: center !important;
                                  }
                                  }
                                  /* Attribute list ------------------------------ */
                                  
                                  .attributes {
                                  margin: 0 0 21px;
                                  }
                                  
                                  .attributes_content {
                                  background-color: #F4F4F7;
                                  padding: 16px;
                                  }
                                  
                                  .attributes_item {
                                  padding: 0;
                                  }
                                  /* Related Items ------------------------------ */
                                  
                                  .related {
                                  width: 100%;
                                  margin: 0;
                                  padding: 25px 0 0 0;
                                  -premailer-width: 100%;
                                  -premailer-cellpadding: 0;
                                  -premailer-cellspacing: 0;
                                  }
                                  
                                  .related_item {
                                  padding: 10px 0;
                                  color: #CBCCCF;
                                  font-size: 15px;
                                  line-height: 18px;
                                  }
                                  
                                  .related_item-title {
                                  display: block;
                                  margin: .5em 0 0;
                                  }
                                  
                                  .related_item-thumb {
                                  display: block;
                                  padding-bottom: 10px;
                                  }
                                  
                                  .related_heading {
                                  border-top: 1px solid #CBCCCF;
                                  text-align: center;
                                  padding: 25px 0 10px;
                                  }
                                  /* Discount Code ------------------------------ */
                                  
                                  .discount {
                                  width: 100%;
                                  margin: 0;
                                  padding: 24px;
                                  -premailer-width: 100%;
                                  -premailer-cellpadding: 0;
                                  -premailer-cellspacing: 0;
                                  background-color: #F4F4F7;
                                  border: 2px dashed #CBCCCF;
                                  }
                                  
                                  .discount_heading {
                                  text-align: center;
                                  }
                                  
                                  .discount_body {
                                  text-align: center;
                                  font-size: 15px;
                                  }
                                  /* Social Icons ------------------------------ */
                                  
                                  .social {
                                  width: auto;
                                  }
                                  
                                  .social td {
                                  padding: 0;
                                  width: auto;
                                  }
                                  
                                  .social_icon {
                                  height: 20px;
                                  margin: 0 8px 10px 8px;
                                  padding: 0;
                                  }
                                  /* Data table ------------------------------ */
                                  
                                  .purchase {
                                  width: 100%;
                                  margin: 0;
                                  padding: 35px 0;
                                  -premailer-width: 100%;
                                  -premailer-cellpadding: 0;
                                  -premailer-cellspacing: 0;
                                  }
                                  
                                  .purchase_content {
                                  width: 100%;
                                  margin: 0;
                                  padding: 25px 0 0 0;
                                  -premailer-width: 100%;
                                  -premailer-cellpadding: 0;
                                  -premailer-cellspacing: 0;
                                  }
                                  
                                  .purchase_item {
                                  padding: 10px 0;
                                  color: #51545E;
                                  font-size: 15px;
                                  line-height: 18px;
                                  }
                                  
                                  .purchase_heading {
                                  padding-bottom: 8px;
                                  border-bottom: 1px solid #EAEAEC;
                                  }
                                  
                                  .purchase_heading p {
                                  margin: 0;
                                  color: #85878E;
                                  font-size: 12px;
                                  }
                                  
                                  .purchase_footer {
                                  padding-top: 15px;
                                  border-top: 1px solid #EAEAEC;
                                  }
                                  
                                  .purchase_total {
                                  margin: 0;
                                  text-align: right;
                                  font-weight: bold;
                                  color: #333333;
                                  }
                                  
                                  .purchase_total--label {
                                  padding: 0 15px 0 0;
                                  }
                                  
                                  body {
                                  background-color: #F4F4F7;
                                  color: #51545E;
                                  }
                                  
                                  p {
                                  color: #51545E;
                                  }
                                  
                                  p.sub {
                                  color: #6B6E76;
                                  }
                                  
                                  .email-wrapper {
                                  width: 100%;
                                  margin: 0;
                                  padding: 0;
                                  -premailer-width: 100%;
                                  -premailer-cellpadding: 0;
                                  -premailer-cellspacing: 0;
                                  background-color: #F4F4F7;
                                  }
                                  
                                  .email-content {
                                  width: 100%;
                                  margin: 0;
                                  padding: 0;
                                  -premailer-width: 100%;
                                  -premailer-cellpadding: 0;
                                  -premailer-cellspacing: 0;
                                  }
                                  /* Masthead ----------------------- */
                                  
                                  .email-masthead {
                                  padding: 25px 0;
                                  text-align: center;
                                  }
                                  
                                  .email-masthead_logo {
                                  width: 94px;
                                  }
                                  
                                  .email-masthead_name {
                                  font-size: 16px;
                                  font-weight: bold;
                                  color: #A8AAAF;
                                  text-decoration: none;
                                  text-shadow: 0 1px 0 white;
                                  }
                                  /* Body ------------------------------ */
                                  
                                  .email-body {
                                  width: 100%;
                                  margin: 0;
                                  padding: 0;
                                  -premailer-width: 100%;
                                  -premailer-cellpadding: 0;
                                  -premailer-cellspacing: 0;
                                  background-color: #FFFFFF;
                                  }
                                  
                                  .email-body_inner {
                                  width: 570px;
                                  margin: 0 auto;
                                  padding: 0;
                                  -premailer-width: 570px;
                                  -premailer-cellpadding: 0;
                                  -premailer-cellspacing: 0;
                                  background-color: #FFFFFF;
                                  }
                                  
                                  .email-footer {
                                  width: 570px;
                                  margin: 0 auto;
                                  padding: 0;
                                  -premailer-width: 570px;
                                  -premailer-cellpadding: 0;
                                  -premailer-cellspacing: 0;
                                  text-align: center;
                                  }
                                  
                                  .email-footer p {
                                  color: #6B6E76;
                                  }
                                  
                                  .body-action {
                                  width: 100%;
                                  margin: 30px auto;
                                  padding: 0;
                                  -premailer-width: 100%;
                                  -premailer-cellpadding: 0;
                                  -premailer-cellspacing: 0;
                                  text-align: center;
                                  }
                                  
                                  .body-sub {
                                  margin-top: 25px;
                                  padding-top: 25px;
                                  border-top: 1px solid #EAEAEC;
                                  }
                                  
                                  .content-cell {
                                  padding: 35px;
                                  }
                                  /*Media Queries ------------------------------ */
                                  
                                  @media only screen and (max-width: 600px) {
                                  .email-body_inner,
                                  .email-footer {
                                      width: 100% !important;
                                  }
                                  }
                                  
                                  @media (prefers-color-scheme: dark) {
                                  body,
                                  .email-body,
                                  .email-body_inner,
                                  .email-content,
                                  .email-wrapper,
                                  .email-masthead,
                                  .email-footer {
                                      background-color: #333333 !important;
                                      color: #FFF !important;
                                  }
                                  p,
                                  ul,
                                  ol,
                                  blockquote,
                                  h1,
                                  h2,
                                  h3,
                                  span,
                                  .purchase_item {
                                      color: #FFF !important;
                                  }
                                  .attributes_content,
                                  .discount {
                                      background-color: #222 !important;
                                  }
                                  .email-masthead_name {
                                      text-shadow: none !important;
                                  }
                                  }
                                  
                                  :root {
                                  color-scheme: light dark;
                                  supported-color-schemes: light dark;
                                  }
                                  </style>
                                  <!--[if mso]>
                                  <style type="text/css">
                                  .f-fallback  {
                                      font-family: Arial, sans-serif;
                                  }
                                  </style>
                              <![endif]-->
                              </head>
                              <body>
                                  <span class="preheader">Wystartowała nowa kolejka</span>
                                  <table class="email-wrapper" width="100%" cellpadding="0" cellspacing="0" role="presentation">
                                  <tr>
                                      <td align="center">
                                      <table class="email-content" width="100%" cellpadding="0" cellspacing="0" role="presentation">
                                          <tr>
                                          <td class="email-masthead">
                                              <a href="https://typer-cup.pl" class="f-fallback email-masthead_name">
                                              TYPER-CUP.PL ⚽
                                          </a>
                                          </td>
                                          </tr>
                                          <!-- Email Body -->
                                          <tr>
                                          <td class="email-body" width="100%" cellpadding="0" cellspacing="0">
                                              <table class="email-body_inner" align="center" width="570" cellpadding="0" cellspacing="0" role="presentation">
                                              <!-- Body content -->
                                              <tr>
                                                  <td class="content-cell">
                                                  <div class="f-fallback">
                                                      <h1>Witaj ${nameCapitalized}!</h1>
                                                      <p><b>Wystartowała nowa kolejka!</b></p>
                                                      <p>Nie zapomnij zapisać swoich typów. Masz czas do: ${endDate}</p>
                                                      <!-- Action -->
                                                      <table class="body-action" align="center" width="100%" cellpadding="0" cellspacing="0" role="presentation">
                                                          <tr>
                                                          <td align="center">
                                                              <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
                                                              <tr>
                                                                  <td align="center">
                                                                  <a href="https://typer-cup.pl/" class="f-fallback button" target="_blank">Zaloguj się</a>
                                                                  </td>
                                                              </tr>
                                                              </table>
                                                          </td>
                                                          </tr>
                                                      </table>
                                                      <p>Jeżeli nie możesz wysłać swoich typów, kliknij w ten link aby dodać losowe typy: <a href="https://typer-cup.pl/randomCode?code=${randomCode.code}" class="f-fallback button" target="_blank">KLIK</a></p> 
                                              <table class="email-footer" align="center" width="570" cellpadding="0" cellspacing="0" role="presentation">
                                              <tr>
                                                  <td class="content-cell" align="center">
                                                  <p class="f-fallback sub align-center">&copy; 2021 [typer-cup.pl]. All rights reserved.</p>
                                                  </td>
                                              </tr>
                                              </table>
                                          </td>
                                          </tr>
                                      </table>
                                      </td>
                                  </tr>
                                  </table>
                              </body>
                              </html>
                              `;
              let mailOptions = {
                from: '"Typer-Cup.pl ⚽ " <powiadomienia@typer-cup.pl>', // sender address
                to: user.email, // list of receivers
                subject: "Wystartowała nowa kolejka 🔜", // Subject line
                html: html, // html body
              };

              transporter.sendMail(mailOptions, function (err, data) {
                if (err) console.log("Error " + err + data);
                else{ 
                  //console.log(err)
                  //console.log(data)
                  console.log("Email Sent")}
              });

            })
          }
          })
        }, 1000 * index);  
        })
    }
  })
  
}

function addNotification(userId) {
  var userNotification = new UserNotification({
    user: userId,
  });

  userNotification.save(function (err, result) {
    if ((err != true) & (err != null)) {
      console.log("***");
      console.log("Błąd dodawania ustawień powiadomień ");
      console.log(`Treść błędu: `);
      console.log(err);
      console.log("***");
    }
  });
}

function getUserNotifications(userId) {
  var def = Q.defer();
  UserNotification.findOne({ user: userId }).exec(function (err, user) {
    err ? def.reject(err) : def.resolve(user);
  });

  return def.promise;
}

function toogleNotification(notificationName, userId) {
  var def = Q.defer();
  if (notificationName == "newRound")
    UserNotification.findOne(
      { user: userId },
      function (err, userNotification) {
        userNotification.newRound = !userNotification.newRound;
        userNotification.save(function (err, updatedNotification) {
          err ? def.reject(err) : def.resolve(updatedNotification);
        });
      }
    );
  if (notificationName == "daySummary")
    UserNotification.findOne(
      { user: userId },
      function (err, userNotification) {
        userNotification.daySummary = !userNotification.daySummary;
        userNotification.save(function (err, updatedNotification) {
          err ? def.reject(err) : def.resolve(updatedNotification);
        });
      }
    );

  if (notificationName == "closeRound")
    UserNotification.findOne(
      { user: userId },
      function (err, userNotification) {
        userNotification.closeRound = !userNotification.closeRound;
        userNotification.save(function (err, updatedNotification) {
          err ? def.reject(err) : def.resolve(updatedNotification);
        });
      }
    );

  if (notificationName == "reminder")
    UserNotification.findOne(
      { user: userId },
      function (err, userNotification) {
        userNotification.reminder = !userNotification.reminder;
        userNotification.save(function (err, updatedNotification) {
          err ? def.reject(err) : def.resolve(updatedNotification);
        });
      }
    );

  return def.promise;
}

function sendReminder(roundDate) {
  var startDate = new Date(moment.tz(roundDate, "Europe/Warsaw"));
  var endDate = new Date(moment.tz(roundDate, "Europe/Warsaw"));
  startDate.setHours(2, 0, 0, 0);
  endDate.setHours(25, 59, 59, 99);
  UserNotification.find().exec(function (err, userNotifications) {
    if (err) console.log(err);
    else {
      userNotifications.forEach((userNotification, index) => {
        setTimeout(() => {
          getUserById(userNotification.user).then((user) => {
            getUserRandomCode(user._id).then(randomCode => {
            Ticket.find({
              user: user._id,
              matchDate: { $gte: startDate, $lte: endDate },
            })
              .count()
              .exec(function (err, tickets) {
                if (tickets == 0) {
                  var nameCapitalized =
                    user.username.charAt(0).toUpperCase() +
                    user.username.slice(1);
        
                  if(typeof randomCode.code == "undefined")
                    randomCode.code="brak";

                  var html = `
                                    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
                                    <html xmlns="http://www.w3.org/1999/xhtml">
                                    <head>
                                        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                                        <meta name="x-apple-disable-message-reformatting" />
                                        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
                                        <meta name="color-scheme" content="light dark" />
                                        <meta name="supported-color-schemes" content="light dark" />
                                        <title></title>
                                        <style type="text/css" rel="stylesheet" media="all">
                                        /* Base ------------------------------ */
                                        
                                        @import url("https://fonts.googleapis.com/css?family=Nunito+Sans:400,700&display=swap");
                                        body {
                                        width: 100% !important;
                                        height: 100%;
                                        margin: 0;
                                        -webkit-text-size-adjust: none;
                                        }
                                        
                                        a {
                                        color: #3869D4;
                                        }
                                        
                                        a img {
                                        border: none;
                                        }
                                        
                                        td {
                                        word-break: break-word;
                                        }
                                        
                                        .preheader {
                                        display: none !important;
                                        visibility: hidden;
                                        mso-hide: all;
                                        font-size: 1px;
                                        line-height: 1px;
                                        max-height: 0;
                                        max-width: 0;
                                        opacity: 0;
                                        overflow: hidden;
                                        }
                                        /* Type ------------------------------ */
                                        
                                        body,
                                        td,
                                        th {
                                        font-family: "Nunito Sans", Helvetica, Arial, sans-serif;
                                        }
                                        
                                        h1 {
                                        margin-top: 0;
                                        color: #333333;
                                        font-size: 22px;
                                        font-weight: bold;
                                        text-align: left;
                                        }
                                        
                                        h2 {
                                        margin-top: 0;
                                        color: #333333;
                                        font-size: 16px;
                                        font-weight: bold;
                                        text-align: left;
                                        }
                                        
                                        h3 {
                                        margin-top: 0;
                                        color: #333333;
                                        font-size: 14px;
                                        font-weight: bold;
                                        text-align: left;
                                        }
                                        
                                        td,
                                        th {
                                        font-size: 16px;
                                        }
                                        
                                        p,
                                        ul,
                                        ol,
                                        blockquote {
                                        margin: .4em 0 1.1875em;
                                        font-size: 16px;
                                        line-height: 1.625;
                                        }
                                        
                                        p.sub {
                                        font-size: 13px;
                                        }
                                        /* Utilities ------------------------------ */
                                        
                                        .align-right {
                                        text-align: right;
                                        }
                                        
                                        .align-left {
                                        text-align: left;
                                        }
                                        
                                        .align-center {
                                        text-align: center;
                                        }
                                        /* Buttons ------------------------------ */
                                        
                                        .button {
                                        background-color: #3869D4;
                                        border-top: 10px solid #3869D4;
                                        border-right: 18px solid #3869D4;
                                        border-bottom: 10px solid #3869D4;
                                        border-left: 18px solid #3869D4;
                                        display: inline-block;
                                        color: #FFF;
                                        text-decoration: none;
                                        border-radius: 3px;
                                        box-shadow: 0 2px 3px rgba(0, 0, 0, 0.16);
                                        -webkit-text-size-adjust: none;
                                        box-sizing: border-box;
                                        }
                                        
                                        .button--green {
                                        background-color: #22BC66;
                                        border-top: 10px solid #22BC66;
                                        border-right: 18px solid #22BC66;
                                        border-bottom: 10px solid #22BC66;
                                        border-left: 18px solid #22BC66;
                                        }
                                        
                                        .button--red {
                                        background-color: #FF6136;
                                        border-top: 10px solid #FF6136;
                                        border-right: 18px solid #FF6136;
                                        border-bottom: 10px solid #FF6136;
                                        border-left: 18px solid #FF6136;
                                        }
                                        
                                        @media only screen and (max-width: 500px) {
                                        .button {
                                            width: 100% !important;
                                            text-align: center !important;
                                        }
                                        }
                                        /* Attribute list ------------------------------ */
                                        
                                        .attributes {
                                        margin: 0 0 21px;
                                        }
                                        
                                        .attributes_content {
                                        background-color: #F4F4F7;
                                        padding: 16px;
                                        }
                                        
                                        .attributes_item {
                                        padding: 0;
                                        }
                                        /* Related Items ------------------------------ */
                                        
                                        .related {
                                        width: 100%;
                                        margin: 0;
                                        padding: 25px 0 0 0;
                                        -premailer-width: 100%;
                                        -premailer-cellpadding: 0;
                                        -premailer-cellspacing: 0;
                                        }
                                        
                                        .related_item {
                                        padding: 10px 0;
                                        color: #CBCCCF;
                                        font-size: 15px;
                                        line-height: 18px;
                                        }
                                        
                                        .related_item-title {
                                        display: block;
                                        margin: .5em 0 0;
                                        }
                                        
                                        .related_item-thumb {
                                        display: block;
                                        padding-bottom: 10px;
                                        }
                                        
                                        .related_heading {
                                        border-top: 1px solid #CBCCCF;
                                        text-align: center;
                                        padding: 25px 0 10px;
                                        }
                                        /* Discount Code ------------------------------ */
                                        
                                        .discount {
                                        width: 100%;
                                        margin: 0;
                                        padding: 24px;
                                        -premailer-width: 100%;
                                        -premailer-cellpadding: 0;
                                        -premailer-cellspacing: 0;
                                        background-color: #F4F4F7;
                                        border: 2px dashed #CBCCCF;
                                        }
                                        
                                        .discount_heading {
                                        text-align: center;
                                        }
                                        
                                        .discount_body {
                                        text-align: center;
                                        font-size: 15px;
                                        }
                                        /* Social Icons ------------------------------ */
                                        
                                        .social {
                                        width: auto;
                                        }
                                        
                                        .social td {
                                        padding: 0;
                                        width: auto;
                                        }
                                        
                                        .social_icon {
                                        height: 20px;
                                        margin: 0 8px 10px 8px;
                                        padding: 0;
                                        }
                                        /* Data table ------------------------------ */
                                        
                                        .purchase {
                                        width: 100%;
                                        margin: 0;
                                        padding: 35px 0;
                                        -premailer-width: 100%;
                                        -premailer-cellpadding: 0;
                                        -premailer-cellspacing: 0;
                                        }
                                        
                                        .purchase_content {
                                        width: 100%;
                                        margin: 0;
                                        padding: 25px 0 0 0;
                                        -premailer-width: 100%;
                                        -premailer-cellpadding: 0;
                                        -premailer-cellspacing: 0;
                                        }
                                        
                                        .purchase_item {
                                        padding: 10px 0;
                                        color: #51545E;
                                        font-size: 15px;
                                        line-height: 18px;
                                        }
                                        
                                        .purchase_heading {
                                        padding-bottom: 8px;
                                        border-bottom: 1px solid #EAEAEC;
                                        }
                                        
                                        .purchase_heading p {
                                        margin: 0;
                                        color: #85878E;
                                        font-size: 12px;
                                        }
                                        
                                        .purchase_footer {
                                        padding-top: 15px;
                                        border-top: 1px solid #EAEAEC;
                                        }
                                        
                                        .purchase_total {
                                        margin: 0;
                                        text-align: right;
                                        font-weight: bold;
                                        color: #333333;
                                        }
                                        
                                        .purchase_total--label {
                                        padding: 0 15px 0 0;
                                        }
                                        
                                        body {
                                        background-color: #F4F4F7;
                                        color: #51545E;
                                        }
                                        
                                        p {
                                        color: #51545E;
                                        }
                                        
                                        p.sub {
                                        color: #6B6E76;
                                        }
                                        
                                        .email-wrapper {
                                        width: 100%;
                                        margin: 0;
                                        padding: 0;
                                        -premailer-width: 100%;
                                        -premailer-cellpadding: 0;
                                        -premailer-cellspacing: 0;
                                        background-color: #F4F4F7;
                                        }
                                        
                                        .email-content {
                                        width: 100%;
                                        margin: 0;
                                        padding: 0;
                                        -premailer-width: 100%;
                                        -premailer-cellpadding: 0;
                                        -premailer-cellspacing: 0;
                                        }
                                        /* Masthead ----------------------- */
                                        
                                        .email-masthead {
                                        padding: 25px 0;
                                        text-align: center;
                                        }
                                        
                                        .email-masthead_logo {
                                        width: 94px;
                                        }
                                        
                                        .email-masthead_name {
                                        font-size: 16px;
                                        font-weight: bold;
                                        color: #A8AAAF;
                                        text-decoration: none;
                                        text-shadow: 0 1px 0 white;
                                        }
                                        /* Body ------------------------------ */
                                        
                                        .email-body {
                                        width: 100%;
                                        margin: 0;
                                        padding: 0;
                                        -premailer-width: 100%;
                                        -premailer-cellpadding: 0;
                                        -premailer-cellspacing: 0;
                                        background-color: #FFFFFF;
                                        }
                                        
                                        .email-body_inner {
                                        width: 570px;
                                        margin: 0 auto;
                                        padding: 0;
                                        -premailer-width: 570px;
                                        -premailer-cellpadding: 0;
                                        -premailer-cellspacing: 0;
                                        background-color: #FFFFFF;
                                        }
                                        
                                        .email-footer {
                                        width: 570px;
                                        margin: 0 auto;
                                        padding: 0;
                                        -premailer-width: 570px;
                                        -premailer-cellpadding: 0;
                                        -premailer-cellspacing: 0;
                                        text-align: center;
                                        }
                                        
                                        .email-footer p {
                                        color: #6B6E76;
                                        }
                                        
                                        .body-action {
                                        width: 100%;
                                        margin: 30px auto;
                                        padding: 0;
                                        -premailer-width: 100%;
                                        -premailer-cellpadding: 0;
                                        -premailer-cellspacing: 0;
                                        text-align: center;
                                        }
                                        
                                        .body-sub {
                                        margin-top: 25px;
                                        padding-top: 25px;
                                        border-top: 1px solid #EAEAEC;
                                        }
                                        
                                        .content-cell {
                                        padding: 35px;
                                        }
                                        /*Media Queries ------------------------------ */
                                        
                                        @media only screen and (max-width: 600px) {
                                        .email-body_inner,
                                        .email-footer {
                                            width: 100% !important;
                                        }
                                        }
                                        
                                        @media (prefers-color-scheme: dark) {
                                        body,
                                        .email-body,
                                        .email-body_inner,
                                        .email-content,
                                        .email-wrapper,
                                        .email-masthead,
                                        .email-footer {
                                            background-color: #333333 !important;
                                            color: #FFF !important;
                                        }
                                        p,
                                        ul,
                                        ol,
                                        blockquote,
                                        h1,
                                        h2,
                                        h3,
                                        span,
                                        .purchase_item {
                                            color: #FFF !important;
                                        }
                                        .attributes_content,
                                        .discount {
                                            background-color: #222 !important;
                                        }
                                        .email-masthead_name {
                                            text-shadow: none !important;
                                        }
                                        }
                                        
                                        :root {
                                        color-scheme: light dark;
                                        supported-color-schemes: light dark;
                                        }
                                        </style>
                                        <!--[if mso]>
                                        <style type="text/css">
                                        .f-fallback  {
                                            font-family: Arial, sans-serif;
                                        }
                                        </style>
                                    <![endif]-->
                                    </head>
                                    <body>
                                        <span class="preheader">Wystartowała nowa kolejka</span>
                                        <table class="email-wrapper" width="100%" cellpadding="0" cellspacing="0" role="presentation">
                                        <tr>
                                            <td align="center">
                                            <table class="email-content" width="100%" cellpadding="0" cellspacing="0" role="presentation">
                                                <tr>
                                                <td class="email-masthead">
                                                    <a href="https://typer-cup.pl" class="f-fallback email-masthead_name">
                                                    TYPER-CUP.PL ⚽
                                                </a>
                                                </td>
                                                </tr>
                                                <!-- Email Body -->
                                                <tr>
                                                <td class="email-body" width="100%" cellpadding="0" cellspacing="0">
                                                    <table class="email-body_inner" align="center" width="570" cellpadding="0" cellspacing="0" role="presentation">
                                                    <!-- Body content -->
                                                    <tr>
                                                        <td class="content-cell">
                                                        <div class="f-fallback">
                                                            <h1>Witaj ${nameCapitalized}!</h1>
                                                            <p><b>Nie zapisałeś swoich typów na aktualną kolejkę.</b></p>
                                                            <p>Masz jeszcze godzinkę - później zamykamy kolejkę ;)</p>
                                                            <!-- Action -->
                                                            <table class="body-action" align="center" width="100%" cellpadding="0" cellspacing="0" role="presentation">
                                                                <tr>
                                                                <td align="center">
                                                                    <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
                                                                    <tr>
                                                                        <td align="center">
                                                                        <a href="https://typer-cup.pl/" class="f-fallback button" target="_blank">Zaloguj się</a>
                                                                        </td>
                                                                    </tr>
                                                                    </table>
                                                                </td>
                                                                </tr>
                                                            </table>
                                                            <p>Jeżeli nie możesz wysłać swoich typów, kliknij w ten link aby dodać losowe typy: <a href="https://typer-cup.pl/randomCode?code=${randomCode.code}" class="f-fallback button" target="_blank">KLIK</a></p>                                                    
                                                    <table class="email-footer" align="center" width="570" cellpadding="0" cellspacing="0" role="presentation">
                                                    <tr>
                                                        <td class="content-cell" align="center">
                                                        <p class="f-fallback sub align-center">&copy; 2022 [typer-cup.pl]. All rights reserved.</p>
                                                        </td>
                                                    </tr>
                                                    </table>
                                                </td>
                                                </tr>
                                            </table>
                                            </td>
                                        </tr>
                                        </table>
                                    </body>
                                    </html>
                                    `;
                  let mailOptions = {
                    from: '"Typer-Cup.pl ⚽ " <admin@typer-cup.pl>', // sender address
                    to: user.email,
                    cc: "catchall@typer-cup.pl", // list of receivers
                    subject:
                      "Za godzinę zamykamy kolejkę, a ty nadal nie zapisałeś swoich typów 🛑", // Subject line
                    html: html, // html body
                  };

                  transporter.sendMail(mailOptions, function (err, data) {
                    if (err) console.log("Error " + err);
                    else console.log("Wysłano Reminder");
                  });
                }
              });
            });
          });
        }, 1000 * index);
      });
    }
  });
}

function sendCloseRoundNotification() {
  UserNotification.find({ closeRound: true }).exec(function (
    err,
    userNotifications
  ) {
    if (err) console.log(err);
    else {
      userNotifications.forEach((userNotification, index) => {
        setTimeout(() => {
          getUserById(userNotification.user).then((user) => {
  
              var nameCapitalized =
                user.username.charAt(0).toUpperCase() + user.username.slice(1);
              const dateOptions = {
                year: "numeric",
                month: "numeric",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              };
              var html = `
                                  <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
                                  <html xmlns="http://www.w3.org/1999/xhtml">
                                  <head>
                                      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                                      <meta name="x-apple-disable-message-reformatting" />
                                      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
                                      <meta name="color-scheme" content="light dark" />
                                      <meta name="supported-color-schemes" content="light dark" />
                                      <title></title>
                                      <style type="text/css" rel="stylesheet" media="all">
                                      /* Base ------------------------------ */
                                      
                                      @import url("https://fonts.googleapis.com/css?family=Nunito+Sans:400,700&display=swap");
                                      body {
                                      width: 100% !important;
                                      height: 100%;
                                      margin: 0;
                                      -webkit-text-size-adjust: none;
                                      }
                                      
                                      a {
                                      color: #3869D4;
                                      }
                                      
                                      a img {
                                      border: none;
                                      }
                                      
                                      td {
                                      word-break: break-word;
                                      }
                                      
                                      .preheader {
                                      display: none !important;
                                      visibility: hidden;
                                      mso-hide: all;
                                      font-size: 1px;
                                      line-height: 1px;
                                      max-height: 0;
                                      max-width: 0;
                                      opacity: 0;
                                      overflow: hidden;
                                      }
                                      /* Type ------------------------------ */
                                      
                                      body,
                                      td,
                                      th {
                                      font-family: "Nunito Sans", Helvetica, Arial, sans-serif;
                                      }
                                      
                                      h1 {
                                      margin-top: 0;
                                      color: #333333;
                                      font-size: 22px;
                                      font-weight: bold;
                                      text-align: left;
                                      }
                                      
                                      h2 {
                                      margin-top: 0;
                                      color: #333333;
                                      font-size: 16px;
                                      font-weight: bold;
                                      text-align: left;
                                      }
                                      
                                      h3 {
                                      margin-top: 0;
                                      color: #333333;
                                      font-size: 14px;
                                      font-weight: bold;
                                      text-align: left;
                                      }
                                      
                                      td,
                                      th {
                                      font-size: 16px;
                                      }
                                      
                                      p,
                                      ul,
                                      ol,
                                      blockquote {
                                      margin: .4em 0 1.1875em;
                                      font-size: 16px;
                                      line-height: 1.625;
                                      }
                                      
                                      p.sub {
                                      font-size: 13px;
                                      }
                                      /* Utilities ------------------------------ */
                                      
                                      .align-right {
                                      text-align: right;
                                      }
                                      
                                      .align-left {
                                      text-align: left;
                                      }
                                      
                                      .align-center {
                                      text-align: center;
                                      }
                                      /* Buttons ------------------------------ */
                                      
                                      .button {
                                      background-color: #3869D4;
                                      border-top: 10px solid #3869D4;
                                      border-right: 18px solid #3869D4;
                                      border-bottom: 10px solid #3869D4;
                                      border-left: 18px solid #3869D4;
                                      display: inline-block;
                                      color: #FFF;
                                      text-decoration: none;
                                      border-radius: 3px;
                                      box-shadow: 0 2px 3px rgba(0, 0, 0, 0.16);
                                      -webkit-text-size-adjust: none;
                                      box-sizing: border-box;
                                      }
                                      
                                      .button--green {
                                      background-color: #22BC66;
                                      border-top: 10px solid #22BC66;
                                      border-right: 18px solid #22BC66;
                                      border-bottom: 10px solid #22BC66;
                                      border-left: 18px solid #22BC66;
                                      }
                                      
                                      .button--red {
                                      background-color: #FF6136;
                                      border-top: 10px solid #FF6136;
                                      border-right: 18px solid #FF6136;
                                      border-bottom: 10px solid #FF6136;
                                      border-left: 18px solid #FF6136;
                                      }
                                      
                                      @media only screen and (max-width: 500px) {
                                      .button {
                                          width: 100% !important;
                                          text-align: center !important;
                                      }
                                      }
                                      /* Attribute list ------------------------------ */
                                      
                                      .attributes {
                                      margin: 0 0 21px;
                                      }
                                      
                                      .attributes_content {
                                      background-color: #F4F4F7;
                                      padding: 16px;
                                      }
                                      
                                      .attributes_item {
                                      padding: 0;
                                      }
                                      /* Related Items ------------------------------ */
                                      
                                      .related {
                                      width: 100%;
                                      margin: 0;
                                      padding: 25px 0 0 0;
                                      -premailer-width: 100%;
                                      -premailer-cellpadding: 0;
                                      -premailer-cellspacing: 0;
                                      }
                                      
                                      .related_item {
                                      padding: 10px 0;
                                      color: #CBCCCF;
                                      font-size: 15px;
                                      line-height: 18px;
                                      }
                                      
                                      .related_item-title {
                                      display: block;
                                      margin: .5em 0 0;
                                      }
                                      
                                      .related_item-thumb {
                                      display: block;
                                      padding-bottom: 10px;
                                      }
                                      
                                      .related_heading {
                                      border-top: 1px solid #CBCCCF;
                                      text-align: center;
                                      padding: 25px 0 10px;
                                      }
                                      /* Discount Code ------------------------------ */
                                      
                                      .discount {
                                      width: 100%;
                                      margin: 0;
                                      padding: 24px;
                                      -premailer-width: 100%;
                                      -premailer-cellpadding: 0;
                                      -premailer-cellspacing: 0;
                                      background-color: #F4F4F7;
                                      border: 2px dashed #CBCCCF;
                                      }
                                      
                                      .discount_heading {
                                      text-align: center;
                                      }
                                      
                                      .discount_body {
                                      text-align: center;
                                      font-size: 15px;
                                      }
                                      /* Social Icons ------------------------------ */
                                      
                                      .social {
                                      width: auto;
                                      }
                                      
                                      .social td {
                                      padding: 0;
                                      width: auto;
                                      }
                                      
                                      .social_icon {
                                      height: 20px;
                                      margin: 0 8px 10px 8px;
                                      padding: 0;
                                      }
                                      /* Data table ------------------------------ */
                                      
                                      .purchase {
                                      width: 100%;
                                      margin: 0;
                                      padding: 35px 0;
                                      -premailer-width: 100%;
                                      -premailer-cellpadding: 0;
                                      -premailer-cellspacing: 0;
                                      }
                                      
                                      .purchase_content {
                                      width: 100%;
                                      margin: 0;
                                      padding: 25px 0 0 0;
                                      -premailer-width: 100%;
                                      -premailer-cellpadding: 0;
                                      -premailer-cellspacing: 0;
                                      }
                                      
                                      .purchase_item {
                                      padding: 10px 0;
                                      color: #51545E;
                                      font-size: 15px;
                                      line-height: 18px;
                                      }
                                      
                                      .purchase_heading {
                                      padding-bottom: 8px;
                                      border-bottom: 1px solid #EAEAEC;
                                      }
                                      
                                      .purchase_heading p {
                                      margin: 0;
                                      color: #85878E;
                                      font-size: 12px;
                                      }
                                      
                                      .purchase_footer {
                                      padding-top: 15px;
                                      border-top: 1px solid #EAEAEC;
                                      }
                                      
                                      .purchase_total {
                                      margin: 0;
                                      text-align: right;
                                      font-weight: bold;
                                      color: #333333;
                                      }
                                      
                                      .purchase_total--label {
                                      padding: 0 15px 0 0;
                                      }
                                      
                                      body {
                                      background-color: #F4F4F7;
                                      color: #51545E;
                                      }
                                      
                                      p {
                                      color: #51545E;
                                      }
                                      
                                      p.sub {
                                      color: #6B6E76;
                                      }
                                      
                                      .email-wrapper {
                                      width: 100%;
                                      margin: 0;
                                      padding: 0;
                                      -premailer-width: 100%;
                                      -premailer-cellpadding: 0;
                                      -premailer-cellspacing: 0;
                                      background-color: #F4F4F7;
                                      }
                                      
                                      .email-content {
                                      width: 100%;
                                      margin: 0;
                                      padding: 0;
                                      -premailer-width: 100%;
                                      -premailer-cellpadding: 0;
                                      -premailer-cellspacing: 0;
                                      }
                                      /* Masthead ----------------------- */
                                      
                                      .email-masthead {
                                      padding: 25px 0;
                                      text-align: center;
                                      }
                                      
                                      .email-masthead_logo {
                                      width: 94px;
                                      }
                                      
                                      .email-masthead_name {
                                      font-size: 16px;
                                      font-weight: bold;
                                      color: #A8AAAF;
                                      text-decoration: none;
                                      text-shadow: 0 1px 0 white;
                                      }
                                      /* Body ------------------------------ */
                                      
                                      .email-body {
                                      width: 100%;
                                      margin: 0;
                                      padding: 0;
                                      -premailer-width: 100%;
                                      -premailer-cellpadding: 0;
                                      -premailer-cellspacing: 0;
                                      background-color: #FFFFFF;
                                      }
                                      
                                      .email-body_inner {
                                      width: 570px;
                                      margin: 0 auto;
                                      padding: 0;
                                      -premailer-width: 570px;
                                      -premailer-cellpadding: 0;
                                      -premailer-cellspacing: 0;
                                      background-color: #FFFFFF;
                                      }
                                      
                                      .email-footer {
                                      width: 570px;
                                      margin: 0 auto;
                                      padding: 0;
                                      -premailer-width: 570px;
                                      -premailer-cellpadding: 0;
                                      -premailer-cellspacing: 0;
                                      text-align: center;
                                      }
                                      
                                      .email-footer p {
                                      color: #6B6E76;
                                      }
                                      
                                      .body-action {
                                      width: 100%;
                                      margin: 30px auto;
                                      padding: 0;
                                      -premailer-width: 100%;
                                      -premailer-cellpadding: 0;
                                      -premailer-cellspacing: 0;
                                      text-align: center;
                                      }
                                      
                                      .body-sub {
                                      margin-top: 25px;
                                      padding-top: 25px;
                                      border-top: 1px solid #EAEAEC;
                                      }
                                      
                                      .content-cell {
                                      padding: 35px;
                                      }
                                      /*Media Queries ------------------------------ */
                                      
                                      @media only screen and (max-width: 600px) {
                                      .email-body_inner,
                                      .email-footer {
                                          width: 100% !important;
                                      }
                                      }
                                      
                                      @media (prefers-color-scheme: dark) {
                                      body,
                                      .email-body,
                                      .email-body_inner,
                                      .email-content,
                                      .email-wrapper,
                                      .email-masthead,
                                      .email-footer {
                                          background-color: #333333 !important;
                                          color: #FFF !important;
                                      }
                                      p,
                                      ul,
                                      ol,
                                      blockquote,
                                      h1,
                                      h2,
                                      h3,
                                      span,
                                      .purchase_item {
                                          color: #FFF !important;
                                      }
                                      .attributes_content,
                                      .discount {
                                          background-color: #222 !important;
                                      }
                                      .email-masthead_name {
                                          text-shadow: none !important;
                                      }
                                      }
                                      
                                      :root {
                                      color-scheme: light dark;
                                      supported-color-schemes: light dark;
                                      }
                                      </style>
                                      <!--[if mso]>
                                      <style type="text/css">
                                      .f-fallback  {
                                          font-family: Arial, sans-serif;
                                      }
                                      </style>
                                  <![endif]-->
                                  </head>
                                  <body>
                                      <span class="preheader">Wystartowała nowa kolejka</span>
                                      <table class="email-wrapper" width="100%" cellpadding="0" cellspacing="0" role="presentation">
                                      <tr>
                                          <td align="center">
                                          <table class="email-content" width="100%" cellpadding="0" cellspacing="0" role="presentation">
                                              <tr>
                                              <td class="email-masthead">
                                                  <a href="https://typer-cup.pl" class="f-fallback email-masthead_name">
                                                  TYPER-CUP.PL ⚽
                                              </a>
                                              </td>
                                              </tr>
                                              <!-- Email Body -->
                                              <tr>
                                              <td class="email-body" width="100%" cellpadding="0" cellspacing="0">
                                                  <table class="email-body_inner" align="center" width="570" cellpadding="0" cellspacing="0" role="presentation">
                                                  <!-- Body content -->
                                                  <tr>
                                                      <td class="content-cell">
                                                      <div class="f-fallback">
                                                          <h1>Witaj ${nameCapitalized}!</h1>
                                                          <p><b>Aktualna kolejka została zamknięta</b></p>
        
                                                          <!-- Action -->
                                                          <table class="body-action" align="center" width="100%" cellpadding="0" cellspacing="0" role="presentation">
                                                              <tr>
                                                              <td align="center">
                                                                  <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
                                                                  <tr>
                                                                      <td align="center">
                                                                        <a href="https://typer-cup.pl/roundSummary" class="f-fallback button" target="_blank">Sprawdź jak typowali inni</a>
                                                                      </td>
                                                                  </tr>
                                                                  </table>
                                                              </td>
                                                              </tr>
                                                          </table>
                                                          
                                                  <table class="email-footer" align="center" width="570" cellpadding="0" cellspacing="0" role="presentation">
                                                  <tr>
                                                      <td class="content-cell" align="center">
                                                      <p class="f-fallback sub align-center">&copy; 2022 [typer-cup.pl]. All rights reserved.</p>
                                                      </td>
                                                  </tr>
                                                  </table>
                                              </td>
                                              </tr>
                                          </table>
                                          </td>
                                      </tr>
                                      </table>
                                  </body>
                                  </html>
                                  `;
              let mailOptions = {
                from: '"Typer-Cup.pl ⚽ " <admin@typer-cup.pl>', // sender address
                to: user.email, // list of receivers
                subject: "Kolejka została zamknięta 🛑 Sprawdź jak typowali inni", // Subject line
                html: html, // html body
              };

              transporter.sendMail(mailOptions, function (err, data) {
                console.log("wysłano");
                if (err) console.log("Error " + err);
              });
           
          });
        }, 1000 * index);
      });
    }
  });
}

function getRunningRound() {
  var def = Q.defer();
  Round.findOne({ state: "running" }).exec(function (err, round) {
    err ? def.reject(err) : def.resolve(round);
  });
  return def.promise;
}

function checkCloseRoundNotification() {
  var def = Q.defer();
  getRunningRound().then((runningRound) => {
    if (!!runningRound) {
      getFirstRoundMatch(runningRound.roundDate).then((firstMatch) => {
        var timezoneTemplate = Date.now();
        var timestamp = new Date(timezoneTemplate, "Europe/Warsaw".format());
        var matchDate = new Date(moment.tz(firstMatch[0].matchDate, "Europe/Warsaw").format());

        if ((timestamp.getHours() == matchDate.getHours()) && (timestamp.getMinutes()== matchDate.getMinutes()) ) {
          console.log("1")
          def.resolve(true);
          sendCloseRoundNotification();
        } else {
          console.log("2")
          def.resolve(false);
        }
      });
    }
  });
}

function checkReminder() {
  getRunningRound().then((runningRound) => {
    getFirstRoundMatch(runningRound.roundDate).then((firstMatch) => {
      var matchDate = new Date(
        moment.tz(firstMatch[0].matchDate, "Europe/Warsaw")
      );
      var timestamp = new Date(moment.tz(Date.now(), "Europe/Warsaw"));
      if(
        (matchDate.getHours() - 2 == timestamp.getHours()) &
        (matchDate.getMinutes() == timestamp.getMinutes()) &
        (matchDate.getDate() == timestamp.getDate()) &
        (matchDate.getMonth() == timestamp.getMonth())
      ) {
        sendReminder(moment.tz(firstMatch[0].matchDate, "Europe/Warsaw"));
      }
    });
  });
}

module.exports = {
  add,
  update,
  getAll,
  getUserByName,
  getUserById,
  changePassword,
  getUserDetails,
  updateUserQuizStatus,
  loginStateUpdate,
  lastLogonUpdate,
  roundEmailNotification,
  getUserNotifications,
  addNotification,
  toogleNotification,
  sendReminder,
  newAccountEmailNotification,
  sendCloseRoundNotification,
  checkCloseRoundNotification,
  checkReminder,
  addAdmin,
  getUserTimezone,
  testRoundEmailNotification,
  updateEmail,
  getUserEmail,
  resetPassword
};
