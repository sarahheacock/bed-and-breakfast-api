
'use strict';

var nodemailer = require('nodemailer');
var express = require("express");

var roomRoutes = express.Router();
var Page = require("../models/page").Page;
var Available = require("../models/available").Available;
var config = require('../configure/config');



roomRoutes.param("availableID", function(req, res, next, id){

    var day = new Date();
    day.setHours(23);

    Available.remove({ date: {$lt: day} }, function(err, result){
      if(err) return next(err);
      Available.find({pageID: id}, function(err, doc){
        if(err) return next(err);
        if(!doc){
          err = new Error("Not Found");
          err.status = 404;
          return next(err);
        }
        req.available = doc;
        next();
    });
  });
});

roomRoutes.param("date", function(req, res, next, id){
  req.oneAvailable = req.available.filter(function(a){
    return a === id;
  });
});


//===================GET ROOMS================================

// availableID is really the date in unix
roomRoutes.get("/:availableID", function(req, res, next){
  res.json(req.available);
});

//================EDIT ROOMS====================================
roomRoutes.post("/:availableID/:roomName/reserve-:dir", function(req, res, next){
    if(req.params.dir.search(/^(reserve|cancel)$/) === -1){
      var err = new Error("Not Found");
      err.status = 404;
      next(err);
    }
    else {
      req.action = req.params.dir;
      req.room = req.available.free;
      next();
    }
  },
  function(req, res, next){
    req.room.update(req.action, req.params.roomName, function(err, updatedRoom){
      if(err) return next(err);
      res.json(updatedRoom);
    });
});


module.exports = roomRoutes;
