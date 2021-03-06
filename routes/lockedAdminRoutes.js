'use strict';

var express = require("express");

var lockedAdminRoutes = express.Router();

var Page = require("../models/page").Page;
var Available = require("../models/available").Available;
var User = require("../models/user").User;
var mid = require('../middleware');

var jwt = require('jsonwebtoken');
var bcrypt = require('bcrypt');


lockedAdminRoutes.param("page", function(req, res, next, id){
  User.find({pageID: id}, function(err, user){
    //console.log(available);
    if(!user){
      var err = new Error("No Users");
      next(err);
    }
    else if (err){
      var err = new Error("Not Found");
      next(err);
    }
    req.users = user.map(function(u){
      return {
        email: u.email,
        billing: u.billing,
        upcoming: u.upcoming
      }
    });
    return next();
  });
});

// lockedAdminRoutes.param("available", function(req, res, next, id){
//   Available.find({pageID: id}, function(err, user){
//     //console.log(available);
//     if(!user){
//       var err = new Error("No Users");
//       next(err);
//     }
//     else if (err){
//       var err = new Error("Not Found");
//       next(err);
//     }
//     req.available = user;
//     return next();
//   });
// });

lockedAdminRoutes.param("pageID", function(req, res, next, id){
  Page.findById(id, function(err, doc){
    if(err) return next(err);
    if(!doc){
      err = new Error("Not Found");
      err.status = 404;
      return next(err);
    }
    req.page = doc;
    return next();
  });
});


lockedAdminRoutes.param("section", function(req,res,next,id){
  req.section = req.page[id];
  if(!req.section){
    var err = new Error("Not Found");
    err.status = 404;
    return next(err);
  }
  next();
});


lockedAdminRoutes.param("sectionID", function(req, res, next, id){
  req.oneSection = req.section.id(id);
  if(!req.oneSection){
    var err = new Error("Not Found");
    err.status = 404;
    return next(err);
  }
  next();
});


//======================EDIT SECTIONS==============================
//get all users
lockedAdminRoutes.get("/:pageID/:page/users", mid.authorizeAdmin, function(req, res){
  res.json(req.users)
});

// lockedAdminRoutes.get("/:available/available", mid.authorizeAdmin, function(req, res){
//   res.json(req.available)
// });


lockedAdminRoutes.get("/:pageID/:section", mid.authorizeAdmin, function(req, res){
  res.json(req.section);
});

//add section
lockedAdminRoutes.post("/:pageID/:section", mid.authorizeAdmin, function(req, res, next){

  req.section.push(req.body);
  req.page.save(function(err, page){
    if(err) return next(err);
    res.status(201);

    if(req.params.section === "rooms"){ //update available if change in rooms
      Available.find({pageID: req.params.pageID}, function(err, available){
        //console.log(available);
        if(!available || err){
          var err = new Error("Not Found");
          next(err);
        }
        available.forEach(function(a, index){
          a.free.push({roomID:page._id});
          a.save(function(err, newA){
            if(err) next(err);
            else if (index === available.length - 1) res.json({page:page, available:available});
          });
        });
      });
    }
    else {
      res.json(page[req.params.section]);
    }
  });
});


lockedAdminRoutes.get("/:pageID/:section/:sectionID", mid.authorizeAdmin, function(req, res){
  res.json(req.oneSection);
});

//edit section
lockedAdminRoutes.put("/:pageID/:section/:sectionID", mid.authorizeAdmin, function(req, res){
  Object.assign(req.oneSection, req.body);
  req.page.save(function(err, result){
    if(err){
      return next(err);
    }
    res.json(result[req.params.section]);
  });
});


//delete section
lockedAdminRoutes.delete("/:pageID/:section/:sectionID", mid.authorizeAdmin, function(req, res){
  req.oneSection.remove(function(err){
    req.page.save(function(err, page){
      if(err) return next(err);
      if(req.params.section === "rooms"){ //update available if change in rooms
        Available.find({pageID: req.params.pageID}, function(err, available){
          //console.log(available);
          if(!available){
            var err = new Error("Not Found");
            next(err);
          }
          available.forEach(function(a, index){
            var filtered = a.free.filter(function(item){
              return item.roomID !== req.params.sectionID;
            });
            filtered.save(function(err, newA){
              if(err) next(err);
              else if (index === available.length - 1) res.json({page:page, available:available});
            });
          });
        });
      }
      else {
        res.json(page[req.params.section]);
      }

    })
  })
});


module.exports = lockedAdminRoutes;
