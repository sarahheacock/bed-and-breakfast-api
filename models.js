'use strict';

//var RoomList = require('./data/roomList');
var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var RoomList = [
  {
    "roomNum": 5,
    "name": "Lakeview",
  },
  {
    "roomNum": 7,
    "name": "Brandywine",
  },
  {
    "roomNum": 3,
    "name": "Lily Pond",
  }
];


var AvailableSchema = new Schema({
  date: Date,
  free: { type: Array, default: RoomList.map(function(room){return room;}) }
});

// AvailableSchema.pre("save", function(next){
//   this.sort({date, 1}), function(err, docs) { if(err) res.json(err); });
// });


var Available = mongoose.model("Available", AvailableSchema);


module.exports.Available = Available;
