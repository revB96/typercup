const Backup = require('./BackupController')
const Round = require("./RoundController")
const User = require("./UserController")
const nodemailer = require("nodemailer");
var CronJobManager = require('cron-job-manager')


cronManager = new CronJobManager()
cronManager.add('backupDatabase8','* * * * *', ()=>{
    console.log("Backup Database...")
    const timestamp = Date.now();
    Backup.dumpMongo2Localfile("");
}, {start: true, timeZone: "Europe/Warsaw"}) //Database backup every day at 8:00

cronManager.add('reminder','0 * * * *', ()=>{
    console.log("Trig reminder")
    User.checkReminder()
}, {start: true, timeZone: "Europe/Warsaw"})

cronManager.add('closeRound14','1 14 * * *', function(){
    User.checkCloseRoundNotification().then(result =>{
        if (result == false)
            cronManager.add('closeRound17','1 17 * * *', function(){
                if(result == false)
                    cronManager.add('closeRound20','1 20 * * *', User.checkCloseRoundNotification(), {start: true, timeZone: "Europe/Warsaw"})
            }, {start: true, timeZone: "Europe/Warsaw"})
    })
}, {start: true, timeZone: "Europe/Warsaw"})

var jobs = cronManager.listCrons();
console.log(jobs)

  