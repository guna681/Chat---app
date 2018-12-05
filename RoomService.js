/** @type {SocketIO.Server} */
let _io;
const MAX_CLIENTS = 10;

/** @param {SocketIO.Socket} socket */
function listen(socket) {
  const io = _io;
  const rooms = io.nsps['/'].adapter.rooms;
  //By Guna 06-12-2018 start
  const connections = [];  
  const users = [];
  var checksessiontime = false;
  var user = false;
  var allow = false;
  //By Guna 06-12-2018 end 
  socket.on('join', function(room) {

    let numClients = 0;
    if (rooms[room]) {
      numClients = rooms[room].length;
    }
    
    //By Guna 06-12-2018 start
    if(checksessiontime && user){
      allow = true;
    }  
    //By Guna 06-12-2018 end

    if (numClients < MAX_CLIENTS && allow) { 

      connections[room].push(socket);

      //By Guna 06-12-2018 start
      socket.on('new user',function(id ,data,callback){
          callback(true);
          users[room].push(data); 
          console.log(users);
          socket.to(id).emit('get users', users);    
      });
   
      socket.on('send message',function (id, message){
        socket.to(id).emit('new message', socket.id, message);
      });
  
      socket.on('video stream ready',function (){
        socket.broadcast.to(room).emit('video stream ready', socket.id);
      });
      socket.on('screen stream ready',function (){
        socket.broadcast.to(room).emit('screen stream ready', socket.id);
      });
      socket.on('audio stream ready',function (){
        socket.broadcast.to(room).emit('audio stream ready', socket.id);
      });
      socket.on('video stream offer',function (id, message){
        socket.to(id).emit('video stream offer', socket.id, message);
      });
      socket.on('screen stream offer',function (id, message){
        socket.to(id).emit('screen stream offer', socket.id, message);
      });
      socket.on('audio stream offer',function (id, message){
        socket.to(id).emit('audio stream offer', socket.id, message);
      });

      socket.on('video stream answer',function (id, message){
        socket.to(id).emit('video stream answer', socket.id, message);
      });
      socket.on('screen stream answer',function (id, message){
        socket.to(id).emit('screen stream answer', socket.id, message);
      });
      socket.on('audio stream answer',function (id, message){
        socket.to(id).emit('audio stream answer', socket.id, message);
      });

      //By Guna 06-12-2018  end
      socket.on('ready', function() {
        socket.broadcast.to(room).emit('ready', socket.id);
      });
      socket.on('offer', function (id, message) {
        socket.to(id).emit('offer', socket.id, message);
      });
      socket.on('answer', function (id, message) {
        socket.to(id).emit('answer', socket.id, message);
      });

      socket.on('candidate', function (id, message) {
        socket.to(id).emit('candidate', socket.id, message);
      });
      socket.on('disconnect', function() {
        socket.broadcast.to(room).emit('bye', socket.id);
      });
      socket.join(room);
    } else {
      socket.emit('full', room);
      socket.emit('not allowed', room);
    }
  });
}



/** @param {SocketIO.Server} io */
module.exports = function(io) {
  _io = io;
  return {listen};
};