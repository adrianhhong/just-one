//// Initialise variables /////
var $doc = $(document);
var $window = $(window);

// Client's details
var username;
var gameCode;
var allClues;

// Initial Socket connection
var socket = io();

// Pages
var $pageArea = $('.page-area'); // The home page
var $homePage = $('.home-page').html(); // The home page
var $createPage = $('.create-page').html(); // The create game page
var $joinPage = $('.join-page').html(); // The join game page
var $lobbyPage = $('.lobby-page').html(); // The game lobby page
var $guesserwaitPage = $('.guesser-wait-page').html(); // The waiting room for the guesser. Waiting for everyone to choose a clue.
var $otherscluePage = $('.others-clue-page').html(); // Page for others to give clues
var $otherswaitPage = $('.others-wait-page').html(); // Page for others to wait for the other others to finish writing their clues
var $othersremovecluesPage = $('.others-remove-clues-page').html(); // Page to remove invalid and duplicate clues
var $guesserguessPage = $('.guesser-guess-page').html(); // The guesser guess word from clues page
var $otherswaitforguessPage = $('.others-wait-for-guess-page').html(); // The guesser guess word from clues page
var $guesserwaitforverificationPage = $('.guesser-wait-for-verification-page').html(); // Wait for verification from others on whether guess was correct.
var $verificationPage = $('.verification-page').html(); // Others verify if the word is correct
var $endPage = $('.end-page').html(); // The guesser guess word from clues page



// Buttons
$doc.on('click', '.newGame', onNewGameClick);
$doc.on('click', '.joinGame', onJoinGameClick);
$doc.on('click', '.createGame', onCreateGameClick);
$doc.on('click', '.backtoHome', onBackToHomeClick);
$doc.on('click', '.startGame', onStartGameClick);
$doc.on('click', '.leaveGame', onLeaveGameClick);
$doc.on('click', '.joinLobby', onJoinLobbyClick);
$doc.on('click', '.copyCode', onAccessCodeDisplayClick);
$doc.on('click', '.validClues', onValidCluesClick);
$doc.on('click', '.guessWord', onGuessWordClick);
$doc.on('click', '.skipWord', onSkipWordClick);
$doc.on('click', '.correct', onCorrectClick);
$doc.on('click', '.incorrect', onIncorrectClick);

// Checkboxes
$doc.on('change', '#check1', function() {
    var isChecked = $('#check1').prop('checked');
    socket.emit('checkboxClicked', gameCode, 'check1', isChecked); 
});

$doc.on('change', '#check2', function() {
    var isChecked = $('#check2').prop('checked');
    socket.emit('checkboxClicked', gameCode, 'check2', isChecked); 
});

$doc.on('change', '#check3', function() {
    var isChecked = $('#check3').prop('checked');
    socket.emit('checkboxClicked', gameCode, 'check3', isChecked); 
});

$doc.on('change', '#check4', function() {
    var isChecked = $('#check4').prop('checked');
    socket.emit('checkboxClicked', gameCode, 'check4', isChecked); 
});

$doc.on('change', '#check5', function() {
    var isChecked = $('#check5').prop('checked');
    socket.emit('checkboxClicked', gameCode, 'check5', isChecked); 
});

$doc.on('change', '#check6', function() {
    var isChecked = $('#check6').prop('checked');
    socket.emit('checkboxClicked', gameCode, 'check6', isChecked); 
});

$doc.on('change', '#check7', function() {
    var isChecked = $('#check7').prop('checked');
    socket.emit('checkboxClicked', gameCode, 'check7', isChecked); 
});




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

    // Visual prompt
    $('.material-icons').html("done");
};

// Submit a clue
function onSubmitClueClick(guesserUsername) {
    clue = $('.clueInput').val();
    socket.emit('clueSubmission', guesserUsername, username, gameCode, clue);
    $pageArea.html($otherswaitPage);
}

// Finished accessing all clues
function onValidCluesClick() {
    var allValidClues = [];
    var j=0;
    for (i=1; i<allClues.length; i++){
        if(! $('#check'+i).prop('checked')){
            allValidClues[j] = allClues[i];
            j++;
        }
    }
    socket.emit('allValidClues', allValidClues, gameCode);
}


function onGuessWordClick(){
    guessersGuess = $('.guessersGuessInput').val().trim();
    socket.emit('guessersGuess', guessersGuess, gameCode);    
}

function onSkipWordClick(){
    socket.emit('skipWord', gameCode)
}

function onCorrectClick(){
    socket.emit('isCorrect', 1, gameCode);
}

function onIncorrectClick(){
    socket.emit('isCorrect', 0, gameCode);
}

/* *************************
   *      OTHER FUNCTIONS       *
   ************************* */

// Refresh the lobby page to show updated players
function refreshPlayers(data) {
    $pageArea.html($lobbyPage);
    
    gameCode = data.gameId;

    // Display the access code
    $('#accesscodeDisplay').html(data.gameId);

    $('.list-group').empty();

    for (var i=0; i<data.players.length; i++){
        if (username == data.players[i]){
            //Include current-player class
            $('.list-group').append($('<li>').attr('class', 'list-group-item current-player d-flex justify-content-between align-items-center').append(data.players[i]).append('<span class="badge badge-dark badge-pill">You</span>'));
        }
        else{
            //dont include the class
            $('.list-group').append($('<li>').attr('class', 'list-group-item d-flex justify-content-between align-items-center').append(data.players[i]));
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
    $('.list-group').append($('<li>').attr('class', 'list-group-item current-player d-flex justify-content-between align-items-center').append(data.username).append('<span class="badge badge-dark badge-pill">You</span>'));
});

socket.on('gameJoined', function (data) {
    console.log("Game Joined! ID is: " + data.gameId)
    $pageArea.html($lobbyPage);
    refreshPlayers(data);
});


socket.on('removedPlayer', function (data) {
    // Make an alert that says someone has disconnected? All disconnects lead back to the lobby page
    refreshPlayers(data);
});


socket.on('nameTaken', function(){
    $('#nameTaken').html("Sorry, that name has been taken.");
        //Need to remove after like 5 sec. and fade out
})


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

socket.on('needMorePlayers', function () {
    $('#morePlayers').html("You need at least 3 players to start."); 
});

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
           onSubmitClueClick(guesserUsername);
        }
    });

})

socket.on('allFinishedClueSubmission', function(guesserUsername, gameCode, clues){
    allClues = clues;

    if(guesserUsername != username){
        $pageArea.html($othersremovecluesPage);
        // Print out each clue, start at 1 since the guesser is 0.
        for (var i=1; i<clues.length; i++) {
            $('#form-check'+i).append($('<input>').attr('class', 'form-check-input').attr('type', 'checkbox').attr('id', 'check'+i));
            $('#form-check'+i).append($('<label>').attr('class', 'form-check-label').attr('for', 'check'+i).append(clues[i]));
        }
    }
});

// When one user clicks a checkbox, all users need their checkbox clicked
socket.on('checkboxChange', function(checkid, isChecked){
    $('#'+checkid).prop('checked', isChecked);
});


socket.on('guesserValidClues', function(guesserUsername, gameCode, allValidClues){
    if(guesserUsername == username){
        $pageArea.html($guesserguessPage);
        for(i=0; i<allValidClues.length; i++){
            $('.list-group').append($('<li>').attr('class', 'list-group-item d-flex justify-content-between align-items-center').append(allValidClues[i]));
        }
        $('.guessersGuessInput').keyup(function (e) {
            if (e.keyCode === 13) {
               onGuessWordClick();
            }
        });
    } else{
        $pageArea.html($otherswaitforguessPage);
    }
});

socket.on('verifyGuess', function(guesserUsername, guessersGuess, actualWord, gameCode){
    if(guesserUsername == username){
        $pageArea.html($guesserwaitforverificationPage);
    } else{
        $pageArea.html($verificationPage);
        // Change all the variables in css
        $('#guesserName').html(guesserUsername);
        $('#guessedWord').html(guessersGuess);
        $('#actualWord').html(actualWord);
    }
});

// endResult: 1 Success, 0 Fail, 2 Skipped Word
socket.on('endScreen', function(guesserUsername, guesserGuess, actualWord, endResult, score, gameCode){
    $pageArea.html($endPage);
    $('#guesserName').html(guesserUsername);
    $('#actualWord').html(actualWord);
    $('#score').html(score)
    if (endResult == 1){
        $('#guessedWord').html(guesserGuess);
        $('#skipped').remove();
        $('#wrong').remove();
    }
    if (endResult == 0){
        $('#guessedWord').html(guesserGuess);
        $('#skipped').remove();
        $('#right').remove();
    }
    if (endResult == 2){
        $('#madeaguess').remove();
    }
})