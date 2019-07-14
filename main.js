
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
var $startGame = $('.startGame'); 
var $leaveGame = $('.leaveGame'); 

// Input Text Fields
var $usernameInput = $('.usernameInput');
var $accesscodeInput =  $('.accesscodeInput');





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

    //Need to remove the username, and then check if there is anyone in the lobby, if no one, then remove the game

    $homePage.show();
    $createPage.hide();
    $joinPage.hide();
    $lobbyPage.hide();
    $gamePage.hide();
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


