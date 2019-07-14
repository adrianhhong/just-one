// Setup basic express server
var express = require('express');
var app = express();
var fs = require('fs');
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;

server.listen(port, function () {
  console.log('Server listening at port %d', port);
  fs.writeFile(__dirname + '/start.log', 'started'); 
});

// Routing
app.use(express.static(__dirname));

// Entire GameCollection Object holds all games and info (This is a singleton object) https://javascript.info/constructor-new
var gameCollection =  new function() {
  this.totalGameCount = 0,
  this.gameList = []
};




function buildGame(username) {


  var gameObject = {};
  gameObject.id = (Math.random()+1).toString(36).slice(2,6).toUpperCase(); //Create a gameID which is a 4-digit code
  gameObject.player1 = username;
  gameObject.player2 = null;
  gameObject.player3 = null;
  gameObject.player4 = null;
  gameObject.player5 = null;
  gameObject.player6 = null;
  gameObject.player7 = null;
  gameObject.player8 = null;
  gameCollection.totalGameCount ++;
  gameCollection.gameList.push({gameObject});
 
  console.log("Game Created by "+ username + " w/ " + gameObject.id);
  // console.log(gameCollection)
  io.emit('gameCreated', {
    username: username,
    gameId: gameObject.id
  });
 
 
}


io.on('connection', function (socket) {
  //when the client  requests to make a Game
  socket.on('createGame', function (username) {
    buildGame(username);
  });

});


