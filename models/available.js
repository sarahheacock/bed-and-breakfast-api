'use strict';

var mongoose = require("mongoose");
var Schema = mongoose.Schema;



var d = new Date();
var FreeSchema = new Schema({
  roomID: Schema.Types.ObjectId,
  reserved: {type: Number, default: 0}
});


var AvailableSchema = new Schema({
  pageID: Schema.Types.ObjectId,
  date: {type: Date, default: d.setHours(10)},
  free: {type: [FreeSchema], default: [FreeSchema]}
});


// AvailableSchema.post('save', function(next) {
//   var day = new Date();
//   day.setHours(19);
//   //FBFriendModel.find({ date: {$lt: day} }).remove().exec()
//   // Available.find({ date: {$lt: day} }, function(err, result){
//   //   console.log(result);
//   //   result.forEach(function(r){
//   //     Available.remove(r);
//   //   })
//   // });
//   // //next();
// });

var Available = mongoose.model("Available", AvailableSchema);

module.exports.Available = Available;
