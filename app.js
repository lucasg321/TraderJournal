var express = require("express"), //require express package
    app = express(),
    bodyParser = require("body-parser"), //body parser package set-up
    mongoose = require("mongoose"), //mongoose for mongodb interaction
    flash = require("connect-flash"),
    passport = require("passport"),
    LocalStrategy = require("passport-local"),
    methodOverride = require("method-override"),
    Trade = require("./models/trade"),
    Comment = require("./models/comment"),
    User = require("./models/user"),
    seedDB = require("./seeds");

    //require routes
var commentRoutes = require("./routes/comments"),
    tradeRoutes = require("./routes/trades"),
    indexRoutes = require("./routes/index")
// mongodb://localhost:27017/trade_journal //useUnifiedTopology: true, 
mongoose.connect("mongodb+srv://admin:admin@cluster0-qxzd4.mongodb.net/trade_journal?retryWrites=true&w=majority", 
{ useNewUrlParser: true }).then(() => {
    console.log("Connected to DB!");
}).catch(err => {
    console.log("Error:", err.message);
});
app.use(bodyParser.urlencoded({extended: true}));
//app.set('views', __dirname+'/views');
app.set("view engine", "ejs");   //set working  directory for ejs package
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
// seed database seedDB();

//Passport configuration
app.use(require("express-session")({
    secret: "day trading is hard",
    resave: false,
    saveUninitialized: false
}));
app.locals.moment = require('moment');
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

app.use(indexRoutes);
app.use("/trades", tradeRoutes);
app.use("/trades/:id/comments", commentRoutes);

app.listen(process.env.PORT || 3000, function(){
    console.log("started");
});
