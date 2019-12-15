var express = require("express");
var router = express.Router({mergeParams: true});
var Trade = require("../models/trade");
var Comment = require("../models/comment");
var middleware = require("../middleware");

//Comments Routes
//new comment page
router.get("/new", middleware.isLoggedIn, function(req, res){
    Trade.findById(req.params.id, function(err, trade){
        if (err){
            console.log(err);
        }   else{
            res.render("comments/new", {trade: trade});
        }
    });
});
//Create a comment
router.post("/", middleware.isLoggedIn, function(req, res){
    Trade.findById(req.params.id, function(err, trade){
        if(err){
            console.log(err);
            redirect("/trade");
        } else{
            Comment.create(req.body.comment, function(err, comment){
                if(err){
                    console.log(err);
                } else {
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    comment.author.profilePic = req.user.profilePic;
                    comment.save();
                    trade.comments.push(comment);
                    trade.save();
                    req.flash("success", "Successfully created a comment");
                    res.redirect("/trades/" + trade._id);
                }
            });
        }
    });
});
//edit route
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res){
    Comment.findById(req.params.comment_id, function(err, fcomment){
        if(err){
            res.redirect("back");
        } else {
            res.render("comments/edit", {trade_id: req.params.id, comment: fcomment});
        }
    });
});

//comment update
router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
        if(err){
            res.redirect("back");
        } else{
            res.redirect("/trades/" + req.params.id);
        }
    });
}); 

//comment destroy
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    Comment.findByIdAndRemove(req.params.comment_id, function(err){
        if (err) {
            res.redirect("back");
        } else {
            req.flash("success", "Comment deleted");
            res.redirect("/trades/" + req.params.id);
        }
    });
});

//middleware to chekc comment ownership
// function checkCommentOwnership(req, res, next){
//     if(req.isAuthenticated()){
//         Comment.findById(req.params.comment_id, function(err, foundComment){
//             if (err){
//                 res.redirect("back");
//             } else {
//                 if(foundComment.author.id.equals(req.user._id)){
//                 next();
//                 } else {
//                     res.redirect("back");
//                 }
//             } 
//         });
//         }else{
//             res.redirect("back");
//         }   
// }

// //middleware to check if user is logged in
// function isLoggedIn(req, res, next){
//     if(req.isAuthenticated()){
//         return next();
//     }
//     res.redirect("/login");
// }

module.exports = router;