'use strict';

var bcrypt = require("bcrypt");
var express = require("express");
var lockedUserRoutes = express.Router();
var User = require("../models/user").User;
var mid = require('../middleware');

lockedUserRoutes.param("userID", function(req, res, next, id){
  User.findById(id, function(err, doc){
    if(err) return next(err);
    if(!doc){
      err = new Error("User Not Found");
      err.status = 404;
      return next(err);
    }
    req.user = doc;
    return next();
  });
})


lockedUserRoutes.param("upcomingID", function(req,res,next,id){
  req.upcoming = req.user.upcoming.id(id);
  if(!req.upcoming){
    err = new Error("Not Found");
    err.status = 404;
    return next(err);
  }
  next();
});

//============================================================
//get user info
lockedUserRoutes.get('/:userID', mid.authorizeUser, function(req, res, next){
  res.json(req.user);
});

//make new reservation
lockedUserRoutes.post("/:userID/upcoming", function(req, res, next){
  req.user.upcoming.push(req.body);
  req.user.save(function(err, user){
    if(err) return next(err);
    res.status(201);
    res.json(user);
  });
});


lockedUserRoutes.get("/:userID/upcoming/:upcomingID", function(req, res){
  res.json(req.upcoming);
});

//cancel reservation
lockedUserRoutes.delete("/:userID/upcoming/:upcomingID", function(req, res){
  req.upcoming.remove(function(err){
    req.user.save(function(err, user){
      if(err) return next(err);
      res.json(user);
    });
  });
});




module.exports = lockedUserRoutes;
