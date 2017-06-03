module.exports = {
  db: {
      production: "mongodb://"+process.env.MONGODB_ADDRESS+":ds117311/bed-and-breakfast-rooms",
      development: "mongodb://"+process.env.MONGODB_ADDRESS+":ds117311/bed-and-breakfast-rooms",
  }
};
