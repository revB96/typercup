const Backup = require('./BackupController')
const User = require("./UserController")
var CronJobManager = require('cron-job-manager')

function configureCronManager(){
    cm = new CronJobManager()

    cm.add('backupDatabase','30 * * * *', ()=>{   //30 * * * *
        console.log("Backup Database...")
        Backup.dumpMongo2Localfile("");
    }, {start: true, timeZone: "Europe/Warsaw"}) 

    // cm.add('reminder','* * * * *', ()=>{
    //     User.checkReminder()
    // }, {start: true, timeZone: "Europe/Warsaw"})

    // cm.add('closeRound','0 * * * *', function(){
    //     User.checkCloseRoundNotification();
    // }, {start: true, timeZone: "Europe/Warsaw"})


    console.log(`I got the current jobs: ${cm}`)
}

module.exports = {
    configureCronManager,
}
  