'use strict';

var mongoose = require("mongoose");
var bcrypt = require("bcrypt");
var Schema = mongoose.Schema;

const temp = new Date().toString().split(' ');
const NOW = new Date(temp[0] + " " + temp[1] + " " + temp[2] + " " + temp[3] + " 10:00:00").getTime();

var sortUpcoming = function(a, b){
  //negative if a before b
  //0 if unchanged order
  //position if a after b
  return b.arrive - a.arrive;
};

var UpcomingSchema = new Schema({
  arrive: Number,
  depart: Number,
  guests: Number,
  room: String,
  createdAt: {type:Date, default:Date.now},
});

UpcomingSchema.method("update", function(updates, callback){
  Object.assign(this, updates, {updatedAt: new Date()});
  this.parent().save(callback);
});


var UserSchema = new Schema({
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    trim: true
  },
  billing: {
    type: String,
    required: true,
    trim: true
  },
  upcoming: [UpcomingSchema],
});

UserSchema.pre("save", function(next){
  this.upcoming.sort(sortUpcoming);
  var user = this;
  bcrypt.hash(user.password, 10, function(err, hash) {
    if (err) {
      return next(err);
    }
    user.password = hash;
    next();
  })
});

var User = mongoose.model("User", UserSchema);

module.exports.User = User;
