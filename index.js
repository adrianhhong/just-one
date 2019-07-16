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
      // console.log(gameCollection);
      if (gameIdTmp == accesscodeJoin){
        //If the accesscode exists, add to game. Find first null and add to that playerno., then join that client to the socket.io room, and emit to all in the same room.
        // var gameIndex = i;
        var emptySlot = (gameCollection.gameList[i]['gameObject']['players']).indexOf(null);
        console.log('emptySlot:'+ emptySlot)
        // for (var j=0; j<8; j++){
          // CONTINUE FROM HERE! THIS IS WHERE IT SCREWS UP! IM NOT FINDING THE PLAYERS PROPERLY....
          // console.log('iterationis: '+i)
          // console.log(gameCollection.gameList[gameIndex]['gameObject']['players'][j])
          // console.log('gameIndex: ' + gameIndex)
          // console.log('this is numeroUNO')
          // if (gameCollection.gameList[i]['gameObject']['players'][j] == null){
            // console.log('number22boi!')
        if (emptySlot != -1){
          gameCollection.gameList[i]['gameObject']['players'][emptySlot] = usernameJoin;
          socket.join(gameCollection.gameList[i]['gameObject']['id']);
          // console.log(gameCollection.gameList[i]['gameObject']['players'])

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


});


