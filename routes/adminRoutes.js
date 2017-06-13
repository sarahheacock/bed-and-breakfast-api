'use strict';

var express = require("express");

var adminRoutes = express.Router();
var Page = require("../models/page").Page;
var jwt = require('jsonwebtoken');
var bcrypt = require('bcrypt');

adminRoutes.param("pageID", function(req, res, next, id){
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

adminRoutes.param("section", function(req,res,next,id){
  req.section = req.page[id];
  if(!req.section){
    var err = new Error("Not Found");
    err.status = 404;
    return next(err);
  }
  next();
});

adminRoutes.param("sectionID", function(req, res, next, id){
  req.oneSection = req.section.id(id);
  if(!req.oneSection){
    var err = new Error("Not Found");
    err.status = 404;
    return next(err);
  }
  next();
});


//======================EDIT SECTIONS==============================
//add section
adminRoutes.post("/:pageID/:section", function(req, res, next){
  req.section.push(req.body);
  req.page.save(function(err, page){
    if(err) return next(err);
    res.status(201);
    res.json(page[req.params.section]);
  });
});

adminRoutes.get("/:pageID/:section/:sectionID", function(req, res){
  res.json(req.oneSection);
});

//edit section
adminRoutes.put("/:pageID/:section/:sectionID", function(req, res){
  Object.assign(req.oneSection, req.body);
  req.page.save(function(err, result){
    if(err) return next(err);
    res.json(result[req.params.section]);
  });
});

//delete section
adminRoutes.delete("/:pageID/:section/:sectionID", function(req, res){
  req.oneSection.remove(function(err){
    req.page.save(function(err, page){
      if(err) return next(err);
      res.json(page[req.params.section]);
    })
  })
});


module.exports = adminRoutes;
