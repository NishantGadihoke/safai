var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var passport = require('passport');
var User = require("../models/user");
var Question = require("../models/trash");


router.get('/leaderboard', (req, res, next) => {
  User.find({username:{$ne: 'users'}}).sort('-points').sort('lastPointOn').exec(function(err, leaderboard) {
    return res.render('leaderboard', { leaderboard: leaderboard });
  });
});

//Render leaderboard page
router.get('/leaderboard', (req, res, next) => {
  User.find().sort('-points').sort('lastLevelOn').exec(function(err, leaderboard) {
    return res.render('leaderboard', { leaderboard: leaderboard });
  });
});


//Render login page
router.get('/login', (req, res, next) => {
  if (req.user) {
    return res.redirect('/');
  }
  return res.render('login', { title: 'Login' });
});

//LOGIN user
router.post('/login', (req, res, next) => {
  passport.authenticate('local', function(err, user) {
    if (err) {
      return res.render('login', { title: 'Login', error : err.message });
    }
    if (!user) {
      return res.render('login', { title: 'Login', error : 'Wrong username/password.' });
    }
    req.logIn(user, function(err) {
      return res.redirect('/');
    });
  })(req, res, next);
});

//Render register page
router.get('/register', (req, res, next) => {
  if (req.user) {
    return res.redirect('/');
  }
  return res.render('register', { title: 'Register' });
});

router.post('/register', (req, res, next) => {
  var username = req.body.name;
  var email = req.body.email;
  var password = req.body.password;
  console.log("details = " + name + " " + email);
  User.register({username: username, email: email}, password, function(err, user) {
    if (err) {
      console.log(err);
      return res.render('register', { error: 'Error: User could not be registered.' });
    }
    return res.render('register', { error: 'User registered successfully.' });
  });
});

//LOGOUT user
router.get('/logout', (req, res, next) => {
  req.logout();
  res.redirect('/');
});

//MAIN ANSWER CHECKING
router.post('/', (req, res, next) => {
  var currentUserUsername = req.user.username;
  var currentUserLevel = req.user.cryptxLevel;
  var currentUserId = req.user.id;

  var logData = {
    username: req.user.username,
    level: currentUserLevel,
    answer: req.body.answer,
    time: new Date()
  };

  //LOG creation
  logs.create(logData, (error, log) => {
    if (error) {
      return next(error);
    }
  });

  Question.checkAnswer(currentUserLevel, req.body.answer, (err) => {
    if (err) {
      return res.redirect('/');
    }

    User.findById(currentUserId, function(err, user) {
      if (!user) {
        return res.redirect('/');
      } else {
        user.cryptxLevel = currentUserLevel + 1;
        user.lastLevelOn = new Date();
        user.save();
        return res.redirect('/');
      }
    });
  });
});


module.exports = router;
