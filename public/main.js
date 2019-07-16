
//// Initialise variables /////
var $window = $(window);
var $usernameInput = $('.usernameInput'); // Input for username
var $messages = $('.messages'); // Messages area
var $inputMessage = $('.inputMessage'); // Input message input box

// Pages
var $homePage = $('.home.page'); // The home page
var $createPage = $('.create.page'); // The create game page
var $joinPage = $('.join.page'); // The join game page
var $lobbyPage = $('.lobby.page'); // The game lobby page
var $gamePage = $('.game.page'); // The main game page

// Buttons
var $newGame = $('.newGame'); 
var $joinGame = $('.joinGame'); 
var $createGame = $('.createGame'); 
var $backtoHome = $('.backtoHome'); 
var $joinLobby = $('.joinLobby'); 
var $startGame = $('.startGame'); 
var $leaveGame = $('.leaveGame'); 

// Input Text Fields
var $usernameInput = $('.usernameInput');
var $accesscodeInput =  $('.accesscodeInput');
var $usernameJoinInput = $('.usernameJoinInput');




// Usernames
var username;

// Initial Socket connection
var socket = io();

// Show Home Page initially
$homePage.show();
$createPage.hide();
$joinPage.hide();
$lobbyPage.hide();
$gamePage.hide();





//// Click Events /////

// New Game Button
$newGame.click(function () {
    $homePage.hide();
    $createPage.show();
    $joinPage.hide();
    $lobbyPage.hide();
    $gamePage.hide();
});

// Join Game Button
$joinGame.click(function () {
    $homePage.hide();
    $createPage.hide();
    $joinPage.show();
    $lobbyPage.hide();
    $gamePage.hide();
});

// Back Button
$backtoHome.click(function () {
    $homePage.show();
    $createPage.hide();
    $joinPage.hide();
    $lobbyPage.hide();
    $gamePage.hide();
});

// Create Game Button
$createGame.click(function () {
    username = $usernameInput.val().trim();
    socket.emit('createGame', username);
});

// Leave Game Button
$leaveGame.click(function () {
    
    //Need to remove the username, and then check if there is anyone in the lobby, if no one, then remove the game, if people, then remove player and readjust order of players

    $homePage.show();
    $createPage.hide();
    $joinPage.hide();
    $lobbyPage.hide();
    $gamePage.hide();
});

// Join Lobby Button
$joinLobby.click(function () {
    var usernameJoin = $usernameJoinInput.val().trim();
    var accesscodeJoin = $accesscodeInput.val().trim();
    socket.emit('joinGame', usernameJoin, accesscodeJoin);
});


socket.on('gameCreated', function (data) {
    console.log("Game Created! ID is: " + data.gameId)
    
    // Display the access code
    var accesscodeDisplay = document.getElementById('accesscodeDisplay');
    accesscodeDisplay.innerHTML = data.gameId;

    var player1Display = document.getElementById('player1Display');
    player1Display.innerHTML = data.username;


    $homePage.hide();
    $createPage.hide();
    $joinPage.hide();
    $lobbyPage.show();
    $gamePage.hide();

});

socket.on('gameJoined', function (data) {
    console.log("Game Joined! ID is: " + data.gameId)
    $homePage.hide();
    $createPage.hide();
    $joinPage.hide();
    $lobbyPage.show();
    $gamePage.hide();
    // Display the access code
    var accesscodeDisplay = document.getElementById('accesscodeDisplay');
    accesscodeDisplay.innerHTML = data.gameId;

    for (var i=0; i<8; i++){
        if (data.players[i] != null){
            var playerDisplay = document.getElementById('player'+(i+1)+'Display');
            playerDisplay.innerHTML = data.players[i];
        }
    }
});

socket.on('cantFindGametoJoin', function(){
    var noGameFoundDisplay = document.getElementById('noGameFound');
    noGameFoundDisplay.innerHTML = "Sorry, no game found with that access code.";
    //Need to remove after like 5 sec. and fade out
})


socket.on('noPlayerSlotsAvailable', function(){
    var noRoomDisplay = document.getElementById('noRoom');
    noRoomDisplay.innerHTML = "Sorry, that game room is full.";
    //Need to remove after like 5 sec. and fade out
})