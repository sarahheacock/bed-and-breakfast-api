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

//edit user info
lockedUserRoutes.put('/:userID', mid.authorizeUser, function(req, res, next){
  if(req.body.email){
    req.user.email = req.body.email;
  }
  if(req.body.billing){
    req.user.billing = req.body.billing;
  }
  if(req.body.credit){
    req.user.credit = req.body.credit;
  }

  req.user.save(function(err, user){
    if(err) return next(err);
    res.status(200);
    res.json(user);
  })
});

//make new reservation
lockedUserRoutes.post("/:userID/upcoming", mid.authorizeUser, function(req, res, next){
  req.user.upcoming.push(req.body);
  req.user.save(function(err, user){
    if(err) return next(err);
    res.status(201);
    res.json(user);
  });
});


lockedUserRoutes.get("/:userID/upcoming/:upcomingID", mid.authorizeUser, function(req, res){
  res.json(req.upcoming);
});

//cancel reservation
lockedUserRoutes.delete("/:userID/upcoming/:upcomingID", mid.authorizeUser, function(req, res){
  req.upcoming.remove(function(err){
    req.user.save(function(err, user){
      if(err) return next(err);
      res.json(user);
    });
  });
});




module.exports = lockedUserRoutes;
