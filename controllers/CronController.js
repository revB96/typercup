const Backup = require('./BackupController')
const Round = require("./RoundController")
const User = require("./UserController")
const nodemailer = require("nodemailer");
var CronJobManager = require('cron-job-manager')


cm = new CronJobManager()

cm.add('backupDatabase','30 * * * *', ()=>{   //30 * * * *
    console.log("Backup Database...")
    Backup.dumpMongo2Localfile("");
}, {start: true, timeZone: "Europe/Warsaw"}) //Database backup every day at 8:00

cm.add('reminder','* * * * *', ()=>{
    //console.log("Trig reminder")
    User.checkReminder()
}, {start: true, timeZone: "Europe/Warsaw"})

cm.add('closeRound','0 * * * *', function(){
    User.checkCloseRoundNotification();
    //console.log("Close Round")
}, {start: true, timeZone: "Europe/Warsaw"})


var jobs = cm.listCrons();

console.log(jobs)

  