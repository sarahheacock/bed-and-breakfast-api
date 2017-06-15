function authorizeAdmin(req, res, next){
  if(req.decoded.adminID !== req.page.adminID){
    var err = new Error("You are not authorized");
    return next(err);
  }
  return next();
}

function authorizeUser(req, res, next){
  //console.log(req.user.userID);
  console.log(req.decoded.userID);
  if(req.decoded.userID !== req.user.userID){
    var err = new Error("You are not authorized");
    return next(err);
  }
  return next();
}

module.exports.authorizeAdmin = authorizeAdmin;
module.exports.authorizeUser = authorizeUser;
