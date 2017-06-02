'use strict';

var RoomList = require('./data/roomList');

//var AvailableRooms = require('./data/availableRooms');

var mongoose = require("mongoose");
var Schema = mongoose.Schema;

const temp = new Date().toString().split(' ');
let NOW = new Date(temp[0] + " " + temp[1] + " " + temp[2] + " " + temp[3] + " 10:00:00").getTime();

var RoomSchema = new Schema({
  name: String,
  cost: String,
  image: String,
  description: String,
});


var AvailableSchema = new Schema({
  date: Number,
  free: Array
});

var UserSchema = new Schema({
  email: String,
  password: String,
  billing: {
    line1: String,
    line2: String,
    city: String,
    state: String,
    zip: String,
    country: String,
  },
  upcoming: [{
    arrive: Number,
    depart: Number,
    guests: Number,
    room: Number,
  }]
});

UserSchema.pre("save", function(next){
  next();
});


var Room = mongoose.model("Room", RoomSchema);

Room.find({})
  .exec(function(err, room){
    if(err) return next(err);
    if(room.length === 0){
      Room.create(RoomList, function(err){
        if(err) console.log(err);
      });
    }
  });


//console.log(AvailableRooms);
var Available = mongoose.model("Available", AvailableSchema);

Available.find({})
  .exec(function(err, availableList){
    //remove expired dates
    if(err) console.error(err);
    availableList.forEach(function(available){
      if(available.date <= NOW){
        Available.remove({date: available.date}, function(err){
          console.error(err);
        });
      }
    });
  });



var User = mongoose.model("User", UserSchema);

module.exports.Available = Available;
module.exports.User = User;
module.exports.Room = Room;
