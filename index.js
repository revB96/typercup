if(process.env.NODE_ENV !=='production'){
    require('dotenv').config()
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

const api = require("./api/api");
const User = require("./controllers/UserController");
const routes = require('./routes/routes');
const DB = config.database;

//database connect
mongoose.connect(`mongodb+srv://${DB.USER}:${DB.PASSWORD}@cluster0.tr3d2.mongodb.net/${DB.DBNAME}?retryWrites=true&w=majority`,
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
app.listen(1996, function () {
    console.log("Server is running at 20482 port...");
})