'use strict';

var bcrypt = require('bcrypt');
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
//var Available = require("./models/available").Available;


var sortAbout = function(a, b){
  return b.title - a.title;
};

var sortRooms = function(a, b){
  return b.title - a.title;
};

var sortLocalGuide = function(a, b){
  if(b.categorty === a.category) return a.title - b.title;
  return b.category - a.category;
};

var makeid = function(){
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 16; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

var HomeSchema = new Schema({
  carousel: {type: Array, default: ["https://images.pexels.com/photos/352728/pexels-photo-352728.jpeg?w=940&h=650&auto=compress&cs=tinysrgb", "https://images.pexels.com/photos/210557/pexels-photo-210557.jpeg?w=940&h=650&auto=compress&cs=tinysrgb", "https://images.pexels.com/photos/29410/pexels-photo-29410.jpg?w=940&h=650&auto=compress&cs=tinysrgb"]},
  bold: {type: String, default: "Venmo 8-bit chambray thundercats. Jianbing drinking vinegar vinyl brunch, blog pop-up flexitarian plaid ramps quinoa food truck pok pok man bun taxidermy. "},
  summary: {type: String, default:"Lomo distillery man bun put a bird on it asymmetrical, hoodie air plant authentic narwhal humblebrag food truck pickled edison bulb. Man bun lyft activated charcoal, vegan 90's sartorial stumptown live-edge DIY. Tousled etsy craft beer lumbersexual tacos, hoodie butcher art party readymade. Vice lumbersexual adaptogen vinyl ethical small batch. VHS chicharrones gluten-free, vinyl man bun yr pop-up lyft normcore master cleanse asymmetrical art party. Jean shorts narwhal live-edge, enamel pin meh synth street art brooklyn typewriter. Lo-fi mixtape banjo, lomo gochujang bicycle rights retro scenester butcher single-origin coffee la croix lumbersexual pour-over kombucha."},
});

var AboutSchema = new Schema({
  image: {type: String, default: "https://images.pexels.com/photos/210499/pexels-photo-210499.jpeg?w=940&h=650&auto=compress&cs=tinysrgb"},
  summary: {type: String, default: "Semiotics pinterest DIY beard, cold-pressed kombucha vape meh flexitarian YOLO cronut subway tile gastropub. Trust fund 90's small batch, skateboard cornhole deep v actually before they sold out thundercats XOXO celiac meditation lomo hexagon tofu. Skateboard air plant narwhal, everyday carry waistcoat pop-up pinterest kitsch. Man bun vape banh mi, palo santo kinfolk sustainable selfies pug meditation kale chips organic PBR&B vegan pok pok. Lomo flexitarian viral yr man braid vexillologist. Bushwick williamsburg bicycle rights, sriracha succulents godard single-origin coffee fam activated charcoal."},
  bold: {type: String, default: "Venmo 8-bit chambray thundercats. Jianbing drinking vinegar vinyl brunch, blog pop-up flexitarian plaid ramps quinoa food truck pok pok man bun taxidermy. "},
  title: {type: String, default: "Title"},
});


var LocalGuideSchema = new Schema({
  title: {type:String, default:"Title"},
  description: {type: String, default:"Plaid live-edge yr, meh put a bird on it enamel pin godard cornhole drinking vinegar banh mi flannel pug. Art party fixie lo-fi shabby chic forage. Meh craft beer blog, chicharrones small batch knausgaard flexitarian ugh banh mi. Occupy tattooed franzen, actually unicorn umami synth. Tacos godard kickstarter shaman cred pour-over. Offal pickled trust fund beard letterpress asymmetrical post-ironic jean shorts. Ethical shabby chic vape deep v vice woke af."},
  address: {type:String, default: "1640 Gateway Road, Portland, Oregon 97232"},
  link: {type:String, default: "#"},
  image: {type: String, default:"https://images.pexels.com/photos/210557/pexels-photo-210557.jpeg?w=940&h=650&auto=compress&cs=tinysrgb"},
  category: {type: String, default: "Restaurants & Coffee Shops"}
});

var RoomSchema = new Schema({
  image: {type: String, default: "https://images.pexels.com/photos/29410/pexels-photo-29410.jpg?w=940&h=650&auto=compress&cs=tinysrgb"},
  carousel: {type: Array, default: ["https://images.pexels.com/photos/286483/pexels-photo-286483.jpeg?w=940&h=650&auto=compress&cs=tinysrgb"]},
  summary: {type: String, default: "Semiotics pinterest DIY beard, cold-pressed kombucha vape meh flexitarian YOLO cronut subway tile gastropub. Trust fund 90's small batch, skateboard cornhole deep v actually before they sold out thundercats XOXO celiac meditation lomo hexagon tofu. Skateboard air plant narwhal, everyday carry waistcoat pop-up pinterest kitsch. Man bun vape banh mi, palo santo kinfolk sustainable selfies pug meditation kale chips organic PBR&B vegan pok pok. Lomo flexitarian viral yr man braid vexillologist. Bushwick williamsburg bicycle rights, sriracha succulents godard single-origin coffee fam activated charcoal."},
  bold: {type: String, default: "Venmo 8-bit chambray thundercats. Jianbing drinking vinegar vinyl brunch, blog pop-up flexitarian plaid ramps quinoa food truck pok pok man bun taxidermy. "},
  title: {type: String, default: "Title"},
  available: {type: Number, default: 1},
  maximumOccupancy: {type: Number, default: 2}
})


var PageSchema = new Schema({
  username: {
    type: String,
    //unique: true,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  adminID: {
    type: String,
    default: makeid
  },
  home: {type:[HomeSchema], default:[HomeSchema]},
  about: {type:[AboutSchema], default:[AboutSchema, AboutSchema]},
  rooms: {type:[RoomSchema], default:[RoomSchema]},
  localGuide: {type:[LocalGuideSchema], default:[LocalGuideSchema]},
});

// authenticate input against database documents
PageSchema.statics.authenticate = function(username, password, callback) {
  Page.findOne({ username: username })
      .exec(function (error, user) {
        if (error) {
          return callback(error);
        } else if ( !user ) {
          var err = new Error('User not found.');
          err.status = 401;
          return callback(err);
        }
        bcrypt.compare(password, user.password , function(error, result) {
          if (result === true) {
            return callback(null, user);
          } else {
            return callback();
          }
        })
      });
}

// hash password before saving to database
PageSchema.pre('save', function(next) {
  var page = this;
  if(page.password.length <= 16){
    bcrypt.hash(page.password, 10, function(err, hash) {
      if (err) {
        return next(err);
      }
      page.password = hash;

      // bcrypt.hash(page.adminID, 10, function(err, hash) {
      //   if (err) {
      //     return next(err);
      //   }
        // page.adminID = hash;
        next();
      // })

    })
  }
  else{
    if(page.about !== undefined) page.about.sort(sortAbout);
    if(page.rooms !== undefined) page.rooms.sort(sortRooms);
    if(page.localGuide !== undefined) page.localGuide.sort(sortLocalGuide);
    //if(page.available !== undefined) page.available.sort(sortLocalGuide);
    next();
  }
});


var Page = mongoose.model("Page", PageSchema);


module.exports.Page = Page;
