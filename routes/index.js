var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");
var Trade = require("../models/trade");
var middleware = require("../middleware");
var async = require("async");
var nodemailer = require("nodemailer");
var crypto = require("crypto");


//root 
router.get("/", function(req, res){     //handles landing page request
    res.render("landing");
});
//Authentication Routes
//show register form
router.get("/register", function(req, res){
    res.render("register");
});
//sign up logic
router.post("/register", function(req, res){
    var newUser = new User(
        {
        firstName: req.body.firstName, 
        lastName: req.body.lastName, 
        username: req.body.username, 
        email: req.body.email, 
        profilePic: req.body.profilePic
    });
    if(req.body.email !== req.body.emailConfirm){
        return res.render("register", {"error": "The Email and Confirm Email fields must match"});
    } else {
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            return res.render("register", {"error": err.message});
        } 
        passport.authenticate("local")(req, res, function(){
            req.flash("success", "Welcome to Trader Journal! "+ user.username);
            res.redirect("/trades");
        });
    });
}
});

//show login form
router.get("/login", function(req, res){
    res.render("login");
});
//login route
router.post("/login", passport.authenticate("local", 
    {
        successRedirect: "/trades", 
        failureRedirect: "/login"
    }), function(req, res){
});

//logout route
router.get("/logout", function(req, res){
    req.logout();
    req.flash("success", "Successfully Logged Out!");
    res.redirect("/trades");
});

router.get('/forgot', function(req, res){
    res.render('forgot');
});

router.post('/forgot', function(req, res, next) {
    async.waterfall([
      function(done) {
        crypto.randomBytes(20, function(err, buf) {
          var token = buf.toString('hex');
          done(err, token);
        });
      },
      function(token, done) {
        User.findOne({ email: req.body.email }, function(err, user) {
          if (!user) {
            req.flash('error', 'No account with that email address exists.');
            return res.redirect('/forgot');
          }
  
          user.resetPasswordToken = token;
          user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
  
          user.save(function(err) {
            done(err, token, user);
          });
        });
      },
      function(token, user, done) {
        var smtpTransport = nodemailer.createTransport({
          service: 'Gmail', 
          auth: {
            user: 'phuduluc@gmail.com',
            pass: 'jyminmypoo8'//process.env.GMAILPW
          }
        });
        var mailOptions = {
          to: user.email,
          from: 'phuduluc@gmail.com',
          subject: 'Node.js Password Reset',
          text: 'A request to reset the password of this account has been received.\n\n' +
            'Please click on the following link, or paste it into your browser to reset your password:\n\n' +
            'http://' + req.headers.host + '/reset/' + token + '\n\n' +
            'If you did not request this, please ignore this email and your password will remain unchanged.\n'
        };
        smtpTransport.sendMail(mailOptions, function(err) {
          console.log('mail sent');
          req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
          done(err, 'done');
        });
      }
    ], function(err) {
      if (err) return next(err);
      res.redirect('/forgot');
    });
  });
  
  router.get('/reset/:token', function(req, res) {
    User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
      if (!user) {
        req.flash('error', 'Password reset token is invalid or has expired.');
        return res.redirect('/forgot');
      }
      res.render('reset', {token: req.params.token});
    });
  });
  
  router.post('/reset/:token', function(req, res) {
    async.waterfall([
      function(done) {
        User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
          if (!user) {
            req.flash('error', 'Password reset token is invalid or has expired.');
            return res.redirect('back');
          }
          if(req.body.password === req.body.confirm) {
            user.setPassword(req.body.password, function(err) {
              user.resetPasswordToken = undefined;
              user.resetPasswordExpires = undefined;
  
              user.save(function(err) {
                req.logIn(user, function(err) {
                  done(err, user);
                });
              });
            })
          } else {
              req.flash("error", "Passwords do not match.");
              return res.redirect('back');
          }
        });
      },
      function(user, done) {
        var smtpTransport = nodemailer.createTransport({
          service: 'Gmail', 
          auth: {
            user: 'phuduluc@gmail.com',
            pass: 'jyminmypoo8'//process.env.GMAILPW
          }
        });
        var mailOptions = {
          to: user.email,
          from: 'phuduluc@gmail.com',
          subject: 'Your password has been changed',
          text: 'Hello,\n\n' +
            'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
        };
        smtpTransport.sendMail(mailOptions, function(err) {
          req.flash('success', 'Success! Your password has been changed.');
          done(err);
        });
      }
    ], function(err) {
      res.redirect('/trades');
    });
  });

//user profiles
router.get("/profiles/:id", function(req, res){
    User.findById(req.params.id, function(err, foundUser){
        if(err) {
            req.flash("error", "Cannot find user profile");
            res.redirect("/");
        } if(req.query.search){
            const regex = new RegExp(escapeRegex(req.query.search), 'gi');
            Trade.find({$or: [{username: regex}, {ticker: regex}]}).where('author.id').equals(foundUser._id).exec(function(err, atrades){ //mongodb or for multiple arguments on search
                if(err){
                    console.log(err);
                    
                } else {
                    res.render("profiles/show", {user: foundUser, trades: atrades});
                }
            });
        } else {
        Trade.find().where('author.id').equals(foundUser._id).exec(function(err, trades){
            if(err) {
                req.flash("error", "Cannot find trades");
                res.redirect("/");
            } 
        res.render("profiles/show", {user: foundUser, trades: trades});
        });
    }
    });
});

//edit profile route
router.get("/profiles/:id/edit", middleware.checkProfileOwnership, function(req, res){
    User.findById(req.params.id, function(err, foundUser){
        if(err){
            res.redirect("back");
        } else {
            res.render("profiles/edit", {user: foundUser});
        }
    });
});

//profile update route
router.put("/profiles/:id", middleware.checkProfileOwnership, function(req, res){ //work on this here
    User.findByIdAndUpdate(req.params.id, req.body.userfield, function(err, updatedUser){
        if(err){
            res.redirect("back");
        } else{
            console.log(updatedUser.firstName);
            res.redirect("/profiles/" + req.params.id);
        }
    });
}); 

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;