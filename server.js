'use strict';

//dependencies
var express = require("express");
var app = express();
var routes = require("./routes");
var jsonParser = require("body-parser").json;
var mongoose = require("mongoose");
var logger = require("morgan");

app.use(logger("dev"));
app.use(jsonParser());

var port = process.env.PORT || 8080;
//var config = require('./config');
//mongodb://your-user:your-pass@host:port/db-name
//mongoose.connect("mongodb://sarahh436:Lucy2003dog@ds117311:8080/bed-and-breakfast-rooms");
//mongoose.connect(config.db[app.settings.env]);
mongoose.connect(process.env.MONGOLAB_ORGANGE_URI);


var db = mongoose.connection;

db.on("error", function(err){
  console.error("connection error:", err);
});

db.once("open", function(){
  console.log("db connection successful");
});

app.use(function(req, res, next){
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  if(req.method === "OPTIONS"){
    res.header("Access-Control-Allow-Methods", "PUT,POST");
    return res.status(200).json({});
  }
  next();
});

//routes
app.use("/hotel", routes);

//catch 404 and forward to error handler
app.use(function(req, res, next){
  var err = new Error("Not Found");
  err.status = 404;
  next(err);
});

//Error Handler
app.use(function(err, req, res, next){
  res.status(err.status || 500);
  res.json({
    error: {
      message: err.message
    }
  });
});

var port = process.env.PORT || 3000;

app.listen(port, function(){
  console.log("Express server is listening on port ", port);
});
