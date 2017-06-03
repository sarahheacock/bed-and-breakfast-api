'use strict';

var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var RoomSchema = new Schema({
  Lakeview: {type: Number, default: 5},
  Brandywine: {type: Number, default: 7},
  Lily: {type: Number, default: 3}
});

RoomSchema.method("update", function(action, room, callback){
  if(action === "cancel"){
    this[room] += 1;
  }
  else if(action === "reserve"){
    this[room] -= 1;
  }
  this.parent().save(callback);
});


var AvailableSchema = new Schema({
  date: Date,
  free: {type: RoomSchema, default: RoomSchema},
});

var Available = mongoose.model("Available", AvailableSchema);
module.exports.Available = Available;
