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

// Setting up ejs views
app.set('views', './views');
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extened: true }))

// Routing
const rooms ={}

app.get('/', (req, res) => {
  res.render('index', { rooms: rooms })
})

app.get('/:room', (req, res) => {
  res.render('room', {roomName: req.params.room})
})


// app.post('/')


// Routing
app.use(express.static(__dirname));

// Entire GameCollection Object holds all games and info (This is a singleton object) https://javascript.info/constructor-new
var gameCollection =  new function() {
  this.totalGameCount = 0,
  this.gameList = []
};



io.on('connection', function (socket) {
  // createGame: when the client  requests to make a Game
  socket.on('createGame', function (username) {
    var gameObject = {};
    gameObject.id = (Math.random()+1).toString(36).slice(2,6).toUpperCase(); //Create a gameID which is a 4-digit code
    gameObject.players =[username, null, null, null, null, null, null, null];
    // gameObject.player1 = socket;
    // gameObject.player2 = null;
    // gameObject.player3 = null;
    // gameObject.player4 = null;
    // gameObject.player5 = null;
    // gameObject.player6 = null;
    // gameObject.player7 = null;
    // gameObject.player8 = null;
    gameCollection.totalGameCount ++;
    gameCollection.gameList.push({gameObject});
   
    socket.join(gameObject.id)
  
    console.log("Game Created by "+ username + " w/ " + gameObject.id);

    io.sockets.in(gameObject.id).emit('gameCreated', {
      username: username,
      gameId: gameObject.id
    });
  });

  socket.on('joinGame', function (usernameJoin, accesscodeJoin) {
    console.log(usernameJoin + " wants to join a game");

    var canFindGametoJoin = false;

    for(var i = 0; i < gameCollection.totalGameCount; i++){
      var gameIdTmp = gameCollection.gameList[i]['gameObject']['id'];
      if (gameIdTmp == accesscodeJoin){
        //If the accesscode exists, add to game. Find first null and add to that playerno., then join that client to the socket.io room, and emit to all in the same room.
        var emptySlot = (gameCollection.gameList[i]['gameObject']['players']).indexOf(null);
        console.log('emptySlot:'+ emptySlot)
        if (emptySlot != -1){
          gameCollection.gameList[i]['gameObject']['players'][emptySlot] = usernameJoin;
          socket.join(gameCollection.gameList[i]['gameObject']['id']);
          io.sockets.in(gameCollection.gameList[i]['gameObject']['id']).emit('gameJoined', {
            players: gameCollection.gameList[i]['gameObject']['players'],
            gameId: gameCollection.gameList[i]['gameObject']['id']
          });
        }
        if (emptySlot == -1){
          //If we have looped through all players, and there is no null, then there is no more space in the lobby, and we need to notify the client
          socket.emit('noPlayerSlotsAvailable')
        }
      }
      canFindGametoJoin = true;
    }
    
    // if we cant find the access code, inform the client
    if (canFindGametoJoin == false){
      socket.emit('cantFindGametoJoin')
    }
    
  });



  socket.on('leaveLobby', function (username, gameCode) {
    //Need to remove the username, and then check if there is anyone in the lobby, if no one, then remove the game, if people, then remove player and readjust order of players

    for(var i = 0; i < gameCollection.totalGameCount; i++){
      var gameIdTmp = gameCollection.gameList[i]['gameObject']['id']
      if (gameIdTmp == gameCode){
        var usernameIndex = (gameCollection.gameList[i]['gameObject']['players']).indexOf(username);
        console.log('my username is :' +username)
        console.log("the index position of the username is at this position: " + usernameIndex)
        if (usernameIndex != -1){
          if (usernameIndex == 0 && (gameCollection.gameList[i]['gameObject']['players']).indexOf(null) == 1){
            --gameCollection.totalGameCount;
            console.log("Destroy Game "+ gameCode + "!");
            gameCollection.gameList.splice(i, 1); //remove that gameObject
            console.log(gameCollection.gameList);
            socket.leave(gameCode)
            socket.emit('gameDestroyed')
          }
          else{
            console.log(gameCollection.gameList[i]['gameObject']['players'])
            console.log("the index position of the username is: " + usernameIndex)
            gameCollection.gameList[i]['gameObject']['players'].splice(usernameIndex,1)
            console.log(gameCollection.gameList[i]['gameObject']['players'])
            gameCollection.gameList[i]['gameObject']['players'].push(null)
            console.log(gameCollection.gameList[i]['gameObject']['players'])
            console.log("Removed player: " + username + " from room " + gameCode)
            io.sockets.in(gameCode).emit('removedPlayer', {
              players: gameCollection.gameList[i]['gameObject']['players'],
              gameId: gameCollection.gameList[i]['gameObject']['id']
            });
          }
        }
        if (username == -1){
          console.log("Something terribly went wrong, can't find the username in the room")
        }

      }
    }
  });
        



  // If a user disconnects.
  socket.on('disconnect', function () {
    //Need to include this
  });

});


