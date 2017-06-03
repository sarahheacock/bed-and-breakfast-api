'use strict';

var express = require("express");
var router = express.Router();

var Available = require("./models").Available;
//var RoomList = require('./data/roomList');



router.param("availableID", function(req, res, next, id){
  //Available.findById(id, function(err, doc){
  const compareDate = new Date(parseInt(id));

  Available.findOne({date: compareDate}).exec(function(err, doc){
    if(err) return next(err);
    //YES, YOU COULD TECHNICALLY CREATE ANY NEW DATE, BUT DATE PICKER SHOULD PREVENT THAT
    //create new entry
    if(!doc){
      const entry = new Available({
        date: compareDate,
      });
      req.available = entry;
      entry.save(function(err, entry){
        if(err) return next(err);
        //res.status(201);

        return next();
      });
    }
    else {
      req.available = doc;
      return next();
    }
  });
});


//================GETTING AND UPDATING NUMBER OF AVAILABLE ROOMS=============
router.get("/", function(req, res){

    const temp = new Date().toString().split(' ');
    const now = new Date(temp[0] + " " + temp[1] + " " + temp[2] + " " + temp[3] + " 10:00:00");

    // Available.find({}, function(err, available){
    //   if(available.length >= 1){
    //     var i = 0;
    //     while(available[i].date <= now){
    //       Available.remove({date: available[i].date}, function(err){
    //         if(err) res.json(err);
    //       });
    //       //i++;
    //     }
    //     if(available[i].date > now){
    //       res.json(available);
    //     }
    //   }
    //   else {
    //     res.json(available);
    //   }
    //
    //   // Available.remove({date: available[1]["date"]}, function(err, room){
    //   //   console.log(available.length);
    //   //   res.json(room);
    //   // });
    //
    //
    // });
    Available.find({date: {$lt: now}}, function(err, rooms){
      if(err) res.json(err);
      if(rooms.length !== 0){
        rooms.forEach(function(room, i){
          Available.remove({date: room.date}, function(err){
            if(err) res.json(err);
          });
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

router.get("/:availableID", function(req, res, next){
  //Available.find({}, null, {sort: {date: 1}}, function(err) {
    //if(err) res.json(err);
    res.json(req.available);
  //});

});


router.post("/:availableID/:roomName/select", function(req, res, next){
    req.room.select(function(err, available){
      if(err) return next(err);
      res.json(available);
    });
});

// router.get("/:arrive/:depart", function(req, res, next){
//   //CREATE AN ARRAY OF DATES OBJECTS
//   let end = parseInt(req.params.depart) - (24*60*60*1000);
//   const begin = parseInt(req.params.arrive);
//   let dateArr = [];
//   var results = [];
//
//   while(end >= begin){
//     dateArr.push(end);
//     end = new Date(end - (24*60*60*1000));
//   }
//
//   dateArr.forEach(function(arr){
//     Available.findOne({date: arr})
//     .exec(function(err, d){
//       if(err) return next(err);
//       //IF NOT IN DATABASE, INSERT ENTRY COPY INTO ARRAY, AND INITIALIZE ENTRY IN DATA
//       console.log("d", d)
//       if(d === null){
//         var newDate = new dateEntry(arr);
//         var available = new Available(newDate);
//         results.push(newDate);
//
//         available.save(function(err, available){
//           if(err) return next(err);
//           res.status(201);
//
//         });
//       }
//       //GET AVAILABLE ENTRY USING DATE, AND INSERT INTO DATE ARRAY
//       else {
//         results.push(d);
//       }
//       console.log(results.length, dateArr.length, results);
//       //REDUCE LIST TO WHAT IS AVAILABLE FOR ALL DATES
//       if(dateArr.length === results.length){
//
//         const search = RoomList.map(function(lookup){
//           const check = results.reduce(function(a,b){return b.free.includes(lookup.room) && a;},true);
//           //const check = results.reduce(function(a,b){return (b["free"][lookup.room] !== 0) && a;},true);
//           if (check) return lookup.room;
//         });
//         res.json({"rooms": search});
//       }
//     })
//   });
// });
//


module.exports = router;
