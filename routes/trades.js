var express = require("express");
var router = express.Router();
var Trade = require("../models/trade");
var middleware = require("../middleware");

//Index route to display trades
router.get("/", function(req, res){    //handles public /trades page request
    if(req.query.search){
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        Trade.find({$or: [{username: regex}, {ticker: regex}]}, function(err, atrades){ //mongodb or for multiple arguments on search
            if(err){
                console.log(err);
                
            } else {
                res.render("trades/index", {trades: atrades, currentUser: req.user}); //sends the trade data to the trades.ejs page
            }
        });
    } else {
    //eval(require('locus'));
    //get trades from DB
    Trade.find({}, function(err, atrades){
        if(err){
            console.log(err);
        } else {
            res.render("trades/index", {trades: atrades, currentUser: req.user}); //sends the trade data to the trades.ejs page
        }
    });
}
});

//format date function
Date.prototype.yyyymmdd = function() {
    var mm = this.getMonth() + 1; // getMonth() is zero-based
    var dd = this.getDate();
  
    return [this.getFullYear(),
            (mm>9 ? '' : '0') + mm,
            (dd>9 ? '' : '0') + dd
           ].join('');
  };

//Create new trades route
router.post("/", middleware.isLoggedIn, function(req, res){ 
    var username = req.body.username;
    var image = req.body.image;
    var ticker = req.body.ticker;
    var type = req.body.type;
    var winOrLoss = req.body.winOrLoss;
    var avgOpen = req.body.avgOpen;
    var avgClose = req.body.avgClose;
    var stop = req.body.stop;
    var description = req.body.description;
    var postDate = new Date();
    postDate = postDate.toISOString().slice(0,10);
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    var newTrade = {username: username, image: image, ticker: ticker, type: type, winOrLoss: winOrLoss, avgOpen: avgOpen, avgClose: avgClose, stop: stop, description: description, author: author, postDate: postDate}
   
    //save trade to database
   Trade.create(newTrade, function(err, newTrade){
        if(err){
            console.log("err");
        } else{
            res.redirect("/trades");
        }
   });
});


//New form to create new trade
router.get("/new", middleware.isLoggedIn, function(req, res){
    res.render("trades/new")
});

//Show - shows a specific trade -- declare before 
router.get("/:id", function(req, res){
     //use the id to find the specific trade and return it
    Trade.findById(req.params.id).populate("comments").exec(function(err, foundTrade){
        if(err){
            console.log(err);
        }else{
            if (!foundTrade) {
                return res.status(400).send("Item not found.")
            }
            res.render("trades/show", {trade: foundTrade, trade_id: req.params.id});
        }
    });
    req.params.id
});

//Edit trade route
router.get("/:id/edit", middleware.checkTradeOwnership, function(req, res){
        Trade.findById(req.params.id, function(err, foundTrade){
            if (!foundTrade) {
                return res.status(400).send("Item not found.")
            }
            if(err){
                console.log(err);
            }
        res.render("trades/edit", {trade: foundTrade});
    });
});


//Update trade route
router.put("/:id", middleware.checkTradeOwnership, function(req, res){
    Trade.findByIdAndUpdate(req.params.id, req.body.trade, function(err, updatedTrade){
        if(err){
            res.redirect("/trades");
        } else {
            res.redirect("/trades/" + req.params.id);
        }
    });
});

//Destroy trade route
router.delete("/:id", middleware.checkTradeOwnership, function(req, res){
    Trade.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/trades");
        } else{
            res.redirect("/trades");
        }
    });
});

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;