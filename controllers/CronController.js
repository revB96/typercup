const Backup = require('./BackupController')
const Round = require("./RoundController")
const User = require("./UserController")
const nodemailer = require("nodemailer");
var CronJobManager = require('cron-job-manager')


cronManager = new CronJobManager()
cronManager.add('backupDatabase8','0 8 * * *', ()=>{Backup.dumpMongo2Localfile()}, {start: true, timeZone: "Europe/Warsaw"}) //Database backup every day at 8:00
cronManager.add('backupDatabase18','0 18 * * *', ()=>{Backup.dumpMongo2Localfile()}, {start: true, timeZone: "Europe/Warsaw"}) //Database backup every day at 18:00
cronManager.add('backupDatabase23','59 23 * * *', ()=>{Backup.dumpMongo2Localfile()}, {start: true, timeZone: "Europe/Warsaw"}) //Database backup every day at 23:59

cronManager.add('reminder','1 * * * *', ()=>{
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

  