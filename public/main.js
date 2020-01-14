//// Initialise variables /////
var $doc = $(document);
var $window = $(window);

// Pages
var $pageArea = $('.page-area'); // The home page
var $homePage = $('.home-page').html(); // The home page
var $createPage = $('.create-page').html(); // The create game page
var $joinPage = $('.join-page').html(); // The join game page
var $lobbyPage = $('.lobby-page').html(); // The game lobby page
var $guesserwaitPage = $('.guesser-wait-page').html(); // The waiting room for the guesser. Waiting for everyone to choose a clue.
var $otherscluePage = $('.others-clue-page').html(); // Page for others to give clues
var $otherswaitPage = $('.others-wait-page').html(); // Page for others to wait for the other others to finish writing their clues
var $gamePage = $('.game-page').html(); // The main game page


// Buttons
$doc.on('click', '.newGame', onNewGameClick);
$doc.on('click', '.joinGame', onJoinGameClick);
$doc.on('click', '.createGame', onCreateGameClick);
$doc.on('click', '.backtoHome', onBackToHomeClick);
$doc.on('click', '.startGame', onStartGameClick);
$doc.on('click', '.leaveGame', onLeaveGameClick);
$doc.on('click', '.joinLobby', onJoinLobbyClick);
$doc.on('click', '.copyCode', onAccessCodeDisplayClick);
$doc.on('click', '.submitClue', onSubmitClueClick);



// Client's details
var username;
var gameCode;

// Initial Socket connection
var socket = io();

// Show Home Page initially
$pageArea.html($homePage);


/* *************************
   *      BUTTON LOGIC       *
   ************************* */
// New Game Button
function onNewGameClick() {
    // Allow you to press enter on input
    $pageArea.html($createPage);
    $('.usernameInput').keyup(function (e) {
        if (e.keyCode === 13) {
           onCreateGameClick();
        }
    });
}

// Join Game Button
function onJoinGameClick() {
    $pageArea.html($joinPage);
    $('.usernameJoinInput').keyup(function (e) {
        if (e.keyCode === 13) {
           onJoinLobbyClick();
        }
    });
    $('.accesscodeInput').keyup(function (e) {
        if (e.keyCode === 13) {
           onJoinLobbyClick();
        }
    });
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
    socket.emit('startGame', gameCode); 
}

// Leave Lobby Button
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

// Access Code Copy Button, copy text to clipboard when pressed
function onAccessCodeDisplayClick() {
    var $temp = $("<input>");
    $("body").append($temp);
    $temp.val(gameCode).select();
    document.execCommand("copy");
    $temp.remove();
}

// Submit a clue
function onSubmitClueClick() {
    clue = $('.submitClue').val();
    socket.emit('clueSubmission', username, gameCode, clue);
    $pageArea.html($otherswaitPage);
}


/* *************************
   *      OTHER FUNCTIONS       *
   ************************* */

// Refresh the lobby page to show updated players
function refreshPlayers(data) {
    gameCode = data.gameId;

    // Display the access code
    $('#accesscodeDisplay').html(data.gameId);

    $('.list-group').empty();

    for (var i=0; i<data.players.length; i++){
        if (username == data.players[i]){
            //Include current-player class
            $('.list-group').append($('<li>').attr('class', 'list-group-item current-player').append(data.players[i]));
        }
        else{
            //dont include the class
            $('.list-group').append($('<li>').attr('class', 'list-group-item').append(data.players[i]));
        }

    }

}


/* *************************
   *      SOCKET.IO LOGIC       *
   ************************* */

socket.on('gameCreated', function (data) {
    console.log("Game Created! ID is: " + data.gameId)

    
    $pageArea.html($lobbyPage);

    gameCode = data.gameId; 

    // Display the access code
    $('#accesscodeDisplay').html(data.gameId);

    // Display player 1
    $('.list-group').append($('<li>').attr('class', 'list-group-item current-player').append(data.username));
});

socket.on('gameJoined', function (data) {
    console.log("Game Joined! ID is: " + data.gameId)
    $pageArea.html($lobbyPage);
    refreshPlayers(data);
});


socket.on('removedPlayer', function (data) {
    refreshPlayers(data);
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

socket.on('allocateGuesser', function(guesserUsername, gameCode){
    $pageArea.html($guesserwaitPage);
    socket.emit('guesserResponse', guesserUsername, gameCode); 
})

socket.on('allocateOthers', function(guesserUsername, gameCode, currentWord){
    $pageArea.html($otherscluePage);
    $('#wordDisplay').html(currentWord);
    $('#guesserDisplay').html(guesserUsername);
    $('.clueInput').keyup(function (e) {
        if (e.keyCode === 13) {
           onSubmitClueClick();
        }
    });

})