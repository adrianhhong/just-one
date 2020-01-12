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
$doc.on('click', '.copyCode', onAccessCodeDisplayClick);

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
    // socket.emit('startGame', username, gameCode); 

    $pageArea.html($gamePage);

    const canvas = document.querySelector("#canvas");
    const ctx = canvas.getContext("2d");

    //Resizing
    canvas.height = 300;
    canvas.width = 300;

    let painting = false;
    let lineComplete = false;

    function startPosition(){
        if (lineComplete) return;
        painting = true;
        draw(e);
    }

    function finishedPosition(){
        painting = false;
        ctx.beginPath()
        lineComplete = true;
    }
    
    function draw(e) {
        if (!painting) return;
        ctx.lineWidth = 5;
        ctx.lineCap = "round";
        ctx.strokeStyle = "red";
        var pos = getMousePos(canvas, e);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
    }

    function getMousePos(canvas, evt) {
        var rect = canvas.getBoundingClientRect();
        return {
            x: (evt.clientX - rect.left) / (rect.right - rect.left) * canvas.width,
            y: (evt.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height
        };
    }

    canvas.addEventListener("mousedown", startPosition);
    canvas.addEventListener("mouseup", finishedPosition);
    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("touchstart", startPosition);
    canvas.addEventListener("touchmove", finishedPosition);
    canvas.addEventListener("touchend", draw);



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


/* *************************
   *      OTHER FUNCTIONS       *
   ************************* */

// Refresh the lobby page to show updated players
function refreshPlayers(data) {
    gameCode = data.gameId;

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
    $('#player1Display').html(data.username);
    $('#player1Display').css('color', '#FF0000');

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