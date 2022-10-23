const Backup = require('./BackupController')
const Round = require("./RoundController")
const User = require("./UserController")
const nodemailer = require("nodemailer");
var CronJobManager = require('cron-job-manager')


cronManager = new CronJobManager()
cronManager.add('backupDatabase8','30 * * * *', ()=>{
    console.log("Backup Database...")
    Backup.dumpMongo2Localfile("");
}, {start: true, timeZone: "Europe/Warsaw"}) //Database backup every day at 8:00

cronManager.add('reminder','* * * * *', ()=>{
    //console.log("Trig reminder")
    User.checkReminder()
}, {start: true, timeZone: "Europe/Warsaw"})

cronManager.add('closeRound','0 * * * *', function(){
    User.checkCloseRoundNotification();
    //console.log("Close Round")
}, {start: true, timeZone: "Europe/Warsaw"})


var jobs = cronManager.listCrons();
console.log(jobs)

  