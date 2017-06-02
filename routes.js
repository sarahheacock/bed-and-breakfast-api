'use strict';

var express = require("express");
var router = express.Router();
var Available = require("./models").Available;
var User = require("./models").User;
var Room = require("./models").Room;

var RoomList = require('./data/roomList');

function dateEntry(date){
  this.date = date;
  this.free = RoomList.map(function(r){ return r.room; });
}

router.param("userID", function(req, res, next, id){
  User.findById(id, function(err, doc){
    if(err) return next(err);
    if(!doc){
      err = new Error("Not Found");
      err.status = 404;
      return next(err);
    }

    req.user = doc;
    return next();
  });
});



router.get("/", function(req, res){
  User.find({})
    .exec(function(err, user){
      if(err) return next(err);
      res.json(user);
    });
});

router.get("/available", function(req, res){
  Available.find({})
    .exec(function(err, available){
      if(err) return next(err);
      res.json(available);
    });
});

router.get("/room", function(req, res){
  Room.find({})
    .exec(function(err, room){
      if(err) return next(err);
      res.json(room);
    });
});

router.get("/:arrive/:depart", function(req, res, next){
  //CREATE AN ARRAY OF DATES OBJECTS
  let end = parseInt(req.params.depart) - (24*60*60*1000);
  const begin = parseInt(req.params.arrive);
  let dateArr = [];
  var results = [];

  while(end >= begin){
    dateArr.push(end);
    end = end - (24*60*60*1000);
  }


  dateArr.forEach(function(arr){
    Available.findOne({date: arr})
    .exec(function(err, d){
      if(err) return next(err);
      //IF NOT IN DATABASE, INSERT ENTRY COPY INTO ARRAY, AND INITIALIZE ENTRY IN DATA
      if(d.length === 0){
        var newDate = new dateEntry(arr);
        var available = new Available(newDate);

        available.save(function(err, available){
          if(err) return next(err);
          res.status(201);
          results.push(newDate);
        });
      }
      //GET AVAILABLE ENTRY USING DATE, AND INSERT INTO DATE ARRAY
      else {
        results.push(d);
      }
      //REDUCE LIST TO WHAT IS AVAILABLE FOR ALL DATES
      if(dateArr.length === results.length){
        const search = RoomList.map(function(lookup){
          const check = results.reduce(function(a,b){return b.free.includes(lookup.room) && a;},true);
          if (check) return lookup.room;
        });
        res.json({"rooms": search});
      }
    })
  });
});

router.post("/", function(req, res, next){
  var user = new User(req.body);
  user.save(function(err, user){
    if(err) return next(err);
    res.status(201);
    res.json(user);
  });
});

router.get("/:userID", function(req, res, next){
  res.json(req.user);
});

//==================Comment out later========
//empty user database
router.delete("/", function(req, res, next){
  //User.remove({});

});
//============================================


module.exports = router;
