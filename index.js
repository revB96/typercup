if(process.env.NODE_ENV !=='production'){
    require('dotenv').config();
}

const express = require("express");
const app = express();
const hbs = require("express-handlebars");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const config = require("./config/config");
const mongoose = require("mongoose");
const helpers = require('handlebars-helpers')();
const passport = require('passport');
const session = require('express-session');
const flash = require('express-flash');
const methodOverride = require('method-override')
const moment = require('moment-timezone');
const api = require("./api/api");
const Messenger = require("./controllers/MessengerController");
//const Backup = require("./controllers/BackupController");
const routes = require('./routes/routes');
const DB = config.database;

mongoose.connect(`mongodb://localhost/${process.env.DB_NAME}?retryWrites=true&w=majority`,
    function (error) {
        error ? console.log(error) : console.log("Successfully connected to database...");
    });


require('./config/passport-config');

/*View engine*/
app.engine(
    "handlebars",
    hbs({
        defaultLayout: "main",
        helpers: {
            dateFormat: require('handlebars-dateformat'),
        },
        runtimeOptions: {
            allowProtoPropertiesByDefault: true,
            allowProtoMethodsByDefault: true,
        },

    })
);

app.set("view engine", "handlebars");

//Body-parser
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use(cookieParser());

app.use(session({
    secret: process.env.SECRET_TOKEN,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true }
  }))

app.use(flash())

app.use(passport.initialize())
app.use(passport.session())


app.use("/api", api);
app.use("/", routes);

app.use(express.static('public'))

/*Run Server*/
app.listen(8081, function () {
    Messenger.testMessage();
    console.log("Server is running at 1996 port...");
})