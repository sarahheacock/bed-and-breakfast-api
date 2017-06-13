'use strict';

var express = require("express");
var router = express.Router();

var Available = require("./models").Available;
var temp = new Date().toString().split(' ');
var now = new Date(temp[0] + " " + temp[1] + " " + temp[2] + " " + temp[3] + " 10:00:00");


router.param("availableID", function(req, res, next, id){
  //Available.findById(id, function(err, doc){
  const compareDate = new Date(parseInt(id));

  Available.findOne({date: compareDate}).exec(function(err, doc){
    if(err) return next(err);
    //DATE HAS TO BE LATER THAN TODAY AND ,...
    //create new entry if not found
    if(!doc){
      const entry = new Available({
        date: compareDate,
        //default free: ...
      });
      req.available = entry;
      entry.save(function(err, entry){
        if(err) return next(err);
        return next();
      });
    }
    //else return found entry
    else {
      req.available = doc;
      return next();
    }
  });
});

//================GETTING AND UPDATING NUMBER OF AVAILABLE ROOMS=============
router.get("/", function(req, res){

  //note--'rooms' is just a copy, in order to see the manipulated data,
  //you have to retrieve the data again with Available.find({}...)
  Available.find({date: {$lt: now}}, function(err, rooms){
    if(err) res.json(err);
    if(rooms.length !== 0){
      rooms.forEach(function(room, i){
        //does this also delete my RoomSchema model??
        Available.remove({date: room.date}, function(err){ if(err) res.json(err); });
        if(i === rooms.length - 1){
          Available.find({}, function(err, available){
              if(err) res.json(err);
              res.json(available);
          });
        }
      });
    }
    else {
      Available.find({}, function(err, available){
          if(err) res.json(err);
          res.json(available);
      });
    }
  });
});

// availableID is really the date in unix
router.get("/:availableID", function(req, res, next){
  res.json(req.available);
});

router.post("/:availableID/:roomName/reserve-:dir", function(req, res, next){
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

module.exports = router;
