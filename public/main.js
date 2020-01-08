
//// Initialise variables /////
var $doc = $(document);
var $window = $(window);
var $usernameInput = $('.usernameInput'); // Input for username
var $messages = $('.messages'); // Messages area
var $inputMessage = $('.inputMessage'); // Input message input box

// Pages
var $pageArea = $('.page-area'); // The home page
var $homePage = $('.home-page').html(); // The home page
var $createPage = $('.create-page').html(); // The create game page
var $joinPage = $('.join-page').html(); // The join game page
var $lobbyPage = $('.lobby-page').html(); // The game lobby page
var $gamePage = $('.game-page').html(); // The main game page

// Buttons
$doc.on('click', '.newGame', onNewGameClick);
$doc.on('click', '.joinGame', onJoinGameClick);
$doc.on('click', '.createGame', onCreateGameClick);
$doc.on('click', '.backtoHome', onBackToHomeClick);
$doc.on('click', '.startGame', onStartGameClick);
$doc.on('click', '.leaveGame', onLeaveGameClick);
$doc.on('click', '.joinLobby', onJoinLobbyClick);

// var $newGame = $('.newGame'); 
// var $joinGame = $('.joinGame'); 
// var $createGame = $('.createGame'); 
// var $backtoHome = $('.backtoHome'); 
// var $joinLobby = $('.joinLobby'); 
// var $startGame = $('.startGame'); 
// var $leaveGame = $('.leaveGame'); 

// Input Text Fields
// var $usernameInput = $('.usernameInput');
// var $accesscodeInput =  $('.accesscodeInput');
// var $usernameJoinInput = $('.usernameJoinInput');




// Client's details
var username;
var gameCode;

// Initial Socket connection
var socket = io();


// Show Home Page initially
$pageArea.html($homePage);


//// Click Events /////
// New Game Button
function onNewGameClick() {
    $pageArea.html($createPage);
}

// Join Game Button
function onJoinGameClick() {
    $pageArea.html($joinPage);
}

// Create Game Button
function onCreateGameClick() {
    // username = $usernameInput.val().trim();
    username = $('.usernameInput').val();
    socket.emit('createGame', username); 
}


// Back Button
function onBackToHomeClick() {
    $pageArea.html($homePage);
}

// Start Game Button
function onStartGameClick() {
    // $pageArea.html($homePage);
}



// Leave Game Button
function onLeaveGameClick() {
    //Need to remove the username, and then check if there is anyone in the lobby, if no one, then remove the game, if people, then remove player and readjust order of players
    socket.emit('leaveLobby', username, gameCode);

    $pageArea.html($homePage);
}

// Join Lobby Button
function onJoinLobbyClick() {

    usernameJoin = $('.usernameJoinInput').val();
    accesscodeJoin = $('.accesscodeInput').val();
    username = usernameJoin;
    gameCode = accesscodeJoin;
    socket.emit('joinGame', usernameJoin, accesscodeJoin);
}







socket.on('gameCreated', function (data) {
    console.log("Game Created! ID is: " + data.gameId)

    
    $pageArea.html($lobbyPage);

    gameCode = data.gameId; 

    // Display the access code
    $('#accesscodeDisplay').html(data.gameId);

    // Display player 1
    $('#player1Display').html(data.username);
    $('#player1Display').css('color', '#FF0000');

});

socket.on('gameJoined', function (data) {
    console.log("Game Joined! ID is: " + data.gameId)

    gameCode = data.gameId;

    $pageArea.html($lobbyPage);
    // Display the access code
    $('#accesscodeDisplay').html(data.gameId);

    for (var i=0; i<8; i++){
        if (data.players[i] != null){
            var playerDisplay = document.getElementById('player'+(i+1)+'Display');
            playerDisplay.innerHTML = data.players[i];
            if (data.players[i] == username){
                playerDisplay.style.color = '#FF0000' 
            }
            else{
                playerDisplay.style.color = '#000000'
            }
        }
        if (data.players[i] == null){
            var playerDisplay = document.getElementById('player'+(i+1)+'Display');
            playerDisplay.innerHTML = '';
        }            
    }
});


socket.on('removedPlayer', function (data) {

    gameCode = data.gameId;
    // Display the access code
    var accesscodeDisplay = document.getElementById('accesscodeDisplay');
    accesscodeDisplay.innerHTML = data.gameId;

    for (var i=0; i<8; i++){
        if (data.players[i] != null){
            var playerDisplay = document.getElementById('player'+(i+1)+'Display');
            playerDisplay.innerHTML = data.players[i];
            if (data.players[i] == username){
                playerDisplay.style.color = '#FF0000' 
            }
            else{
                playerDisplay.style.color = '#000000'
            }
        }
        if (data.players[i] == null){
            var playerDisplay = document.getElementById('player'+(i+1)+'Display');
            playerDisplay.innerHTML = '';
        }            
    }
});


socket.on('cantFindGametoJoin', function(){
    $('#noGameFound').html("Sorry, no game found with that access code.");
        //Need to remove after like 5 sec. and fade out
})


socket.on('noPlayerSlotsAvailable', function(){
    $('#noRoom').html("Sorry, that game room is full.");
    //Need to remove after like 5 sec. and fade out
})

socket.on('gameDestroyed', function(){
    //reset username and gamecode
    username = null;
    gameCode = null;
})