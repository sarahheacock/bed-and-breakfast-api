var RoomList = require('./roomList');

//
const temp = new Date().toString().split(' ');
const now = new Date(temp[0] + " " + temp[1] + " " + temp[2] + " " + temp[3] + " 10:00:00");

const AvailableRooms = [...new Array(365)].map((obj, i) => {

  const rooms = RoomList.map((room, j) => {
    return room.room;
  });

  return (
    {
      //_id: i,
      date: new Date(now.getTime() + i*24*60*60*1000),
      free: rooms
    }
  );
});

module.exports = AvailableRooms;
