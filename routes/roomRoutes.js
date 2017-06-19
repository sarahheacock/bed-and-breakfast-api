
'use strict';

var nodemailer = require('nodemailer');
var express = require("express");

var roomRoutes = express.Router();
var Page = require("../models/page").Page;
var Available = require("../models/available").Available;
var ObjectID = require("mongodb").ObjectID
var config = require('../configure/config');


roomRoutes.param("date", function(req, res, next, id){

    var day = new Date();
    day.setHours(1);

    var arr = id.split("&");

    Available.remove({ date: {$lt: day}}).exec(function(err){
      if(err) return next(err);

      Available.findOne({ pageID: arr[0], date: arr[1] }).exec(function(err, doc){
        if(err || !doc){
          err = new Error("not found");
          err.status = 404;
          return next(err);
        }

        req.date = doc;
        next();
      })
    })
});



//===================GET ROOMS================================

roomRoutes.get("/:date", function(req, res, next){
    res.json(req.date);
});

//===================ADD DATES===================================
roomRoutes.post("/", function(req, res, next){
  //res.json(req.date);
  Page.findById(req.body.pageID, function(err, doc){
    if(err) return next(err);
    if(!doc){
      err = new Error("Not Found");
      err.status = 404;
      return next(err);
    }
    var newAvailable = doc.rooms.map(function(d){
      return {roomID: d._id};
    });
    var room = new Available({
      pageID: req.body.pageID,
      date: req.body.date,
      free: newAvailable
    });
    room.save(function(err, user){
      if(err) return next(err);
      res.status(201);
      res.json(room);
    });
  });

});

//================EDIT ROOMS====================================
roomRoutes.put("/:date/:roomID/reserve-:dir", function(req, res, next){
    //var arr = req.params.date.split("&");

    if(req.params.dir.search(/^(reserve|cancel)$/) === -1){
      var err = new Error("Not Found");
      err.status = 404;
      next(err);
    }
    else {
      req.action = req.params.dir;
      req.free = req.date.free.map(function(r){
        if(r.roomID.equals(req.params.roomID)) return r;
      });
      console.log(req.free);
      next();
    }
  },
  function(req, res, next){
    if(req.free.length === 0){
      var err = new Error("roomID not found");
      err.status = 404;
      next(err);
    }
    else {
      var free = req.free[0];
      free.update(req.action, function(err, updatedRoom){
        if(err) return next(err);
        res.json(updatedRoom);
      });
    }
});


module.exports = roomRoutes;
