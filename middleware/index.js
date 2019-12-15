var Trade = require("../models/trade");
var Comment = require("../models/comment");
var User = require("../models/user");

var middlewareObj ={};

middlewareObj.checkTradeOwnership = function(req, res, next) {
    if(req.isAuthenticated()){
        Trade.findById(req.params.id, function(err, foundTrade){
            if (err){
                req.flash("error", "Trade not found");
                res.redirect("back");
            } else {
                //check if foundTrade exists, and if it doesn't to throw an error via connect-flash and send us back to the homepage
                if (!foundTrade) {
                    req.flash("error", "Item not found.");
                    return res.redirect("back");
                }
                if(foundTrade.author.id.equals(req.user._id)){
                next();
                } else {
                    req.flash("error", "You do not have permission to do that");
                    res.redirect("back");
                }
            } 
        });
        }else{
            req.flash("error", "You need to be logged in to do that");
            res.redirect("back");
        }   
}

middlewareObj.checkCommentOwnership = function(req, res, next) {
    if(req.isAuthenticated()){
        Comment.findById(req.params.comment_id, function(err, foundComment){
            if (err){
                res.redirect("back");
            } else {
                if(foundComment.author.id.equals(req.user._id)){
                next();
                } else {                    
                    req.flash("error", "You do not have permission to do that");
                    res.redirect("back");
                }
            } 
        });
        }else{
            req.flash("error", "You need to be logged in to do that");
            res.redirect("back");
        }   
}

middlewareObj.checkProfileOwnership = function(req, res, next) {
    if(req.isAuthenticated()){
        User.findById(req.params.id, function(err, foundUser){
            if (err){
                req.flash("error", "User not found");
                res.redirect("/trades");
            } else {
                //check if foundUser is the same as the profile, and if it isnt throw an error via connect-flash and send us back to the homepage
                if (!foundUser) {
                    req.flash("error", "User not found.");
                    return res.redirect("/trades");
                }
                else if(foundUser._id.equals(req.user._id)){
                next();
                } else {
                    req.flash("error", "You do not have permission to do that");
                    res.redirect("/trades");
                }
            } 
        });
        }else{
            req.flash("error", "You need to be logged in to do that");
            res.redirect("/trades");
        }   
}

middlewareObj.isLoggedIn = function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "You must be logged in to do that!")
    res.redirect("/login");
}

module.exports = middlewareObj;