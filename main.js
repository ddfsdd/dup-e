//* Added: rematchRequest onclick, html modal*/



//Function immediately called
//alert(message) jQuery display alert box with message
(function init() {
  const P1 = 'X';
  const P2 = 'O';
  let player;
  let game;
  let timer;
  var makeMoveText = '';
  var followMoveText = '';
  var actualFollowMoveText ='';
  var oppWinStatus = '';
  const socket = io.connect('/game');
/////////////////Initialize document//////////////////////
  $(document).ready(function() {
		$('.player_button').on({
			mouseenter: function() {
				toggleColor(this, 'btn-primary', 'btn-warning');
			},
			mouseleave: function() {
				toggleColor(this, 'btn-warning', 'btn-primary');
			},
			click: async function() {
				toggleColor(this, 'btn-warning', 'btn-danger');
				await delay(300);
				$(this).removeClass('btn-danger');
				if ($(this).is(':hover') === true) {
					$(this).addClass('btn-warning');
				} else {
					$(this).addClass('btn-primary');
				}
			},
			//add logic to input data into the array.
    });
    document.onkeyup = press;
	});
  // animate the pattern of the opponent array to follow.
	async function animateAndSetReceiver(array) {
		for (i = 0; i < array.length; i++) {
			let ani_id = '#oppbtn_' + array[i];
			toggleColor(ani_id, 'btn-primary', 'btn-danger');
			await delay(500);
			toggleColor(ani_id, 'btn-danger', 'btn-primary');
      await delay(500);
		}

    player.setCurrentTurn(true);
    player.setReceiver(true);
    timer.setAndStart('follow');

	}

  //for drawing game button
  var p1 = '';
  var p2 = '';
  //create player game button
  for (i = 1; i <= 5; i++) {
    p1 += "<button id='playerbtn_" + i + "' class='btn btn-primary player_button'>" + i + '</button>';
  }
  document.getElementById('player').innerHTML = p1;
  //create opponent game button
  for (i = 1; i <= 5; i++) {
    p2 +=
      "<button id='oppbtn_" +
      i +
      "' class='btn btn-primary disabled opponent_button' style='cursor: not-allowed'>" +
      i +
      '</button>';
  }
  document.getElementById('opponentPlayer').innerHTML = p2;

  //god has granted us the delay function, praise the sun.
  function delay(time) {
  	return new Promise(resolve => setTimeout(resolve, time));
  }

  //remove class and add class to animate the color change.
  function toggleColor(obj, remove, changeTo) {
  	$(obj).removeClass(remove);
  	$(obj).addClass(changeTo);
  }
/////////////////FIN Initialize document//////////////////////

/////////////////Player class//////////////////////
  class Player {
    constructor(name, type) {
      this.name = name;
      this.type = type;
      this.currentTurn = false;
      this.score = 0
      this.receiver = false;
    }

    // Set the bit of the move played by the player
    // tileValue - Bitmask used to set the recently played move.
    updateScore(line,textTocheckWith) {
      var textTocheckWith = textTocheckWith.split('');
      var line = line.split('');
      var bonusMultiplier = 10;
      var combo = 0;
      var points = 0;
      var pernote = 50;
      for(let i =0; i< line.length;i++){
        if(i==textTocheckWith.length){break;}
            if(textTocheckWith[i]==line[i]){
              this.score = points + pernote+bonusMultiplier*combo;
              combo++;
            }else {
              combo = 0;
            }
          }
        $('#score').text(this.getScore());
        //for live score update
			socket.emit('updateScore', {
				senderScore: this.getScore(),
				room: game.getRoomId(),
			});
    }

    getScore() {
      return this.score;
    }

    setScore(score){
      this.score = score;
    }

    // Set the currentTurn for player to turn and update UI to reflect the same.
    setCurrentTurn(turn) {
      this.currentTurn = turn;
      const message = turn ? 'Your turn' : 'Waiting for Opponent';
      $('#turn').text(message);
    }

    setReceiver(rcv){
      this.receiver = rcv;
    }

    getReceiver(){
      return this.receiver;
    }

    getPlayerName() {
      return this.name;
    }

    getPlayerType() {
      return this.type;
    }

    getCurrentTurn() {
      return this.currentTurn;
    }
  }

/////////////////FIN Player class//////////////////////

/////////////////Game class//////////////////////
  // roomId Id of the room in which the game is running on the server.
  class Game {
    constructor(roomId) {
      this.roomId = roomId;
      //this.board = [];
      this.moves = 0;
    }

    // Create the Game board by attaching event listeners to the buttons.
    createGameBoard() {

      timer = new Timer();
      function submitHandler() {
        const button = this.id.split('_')[1];
        //this refers to button
        //getCurrentTurn returns boolean
        //blocks other player
        if (!player.getCurrentTurn() || !game) {
          alert('Its not your turn!');
          return;
        }

        //var line = $('#line').val();
        var textTocheckWith = $('#display').html();
        //comparison, score increases by input correct
        // //only for receiver
        if(player.getReceiver()){
          actualFollowMoveText=(actualFollowMoveText+button).trim();
          if(actualFollowMoveText.split('').length==5){
          var line = actualFollowMoveText;

          player.updateScore(line,textTocheckWith);
          actualFollowMoveText='';
          game.moves++;
          timer.stopAndReset();
          player.setReceiver(false);
          if(game.moves == 2){
            player.setCurrentTurn(false);
            game.checkEnd();
            return;
            }
          $('#turn').text('Its your turn to type something for them to copy!');

          timer.setAndStart('make');

          }
          return;
        }

        makeMoveText= (makeMoveText+button).trim();
       console.log(makeMoveText);
        //tell server, tell opponent info, update their board
        if(makeMoveText.split('').length==5){
          var line = makeMoveText;
          game.playTurn(line);
          timer.stopAndReset();
          //update my board
          game.updateBoard(line);
          makeMoveText='';
          player.setCurrentTurn(false);
        }

      }
      for (let j = 1; j <= 5; j++) {
        $(`#playerbtn_${j}`).on('click', submitHandler);
      }
      for (let j = 1; j <= 5; j++) {
				$(`#playerbtn_${j}`).on('click', function() {
					playBtnSound(j);
				});
			}
      //first initialized
      // for (let i = 0; i < 3; i++) {
      //   tssssssshis.board.push(['', '', '']); //add the array as an element on board
      //   for (let j = 0; j < 3; j++) {
      //     $(`#button_${i}${j}`).on('click', tileClickHandler);
      //     //set all buttons to listen for a click
      //   }
      // }
    }
    // Remove the menu from DOM, display the gameboard and greet the player.
    displayBoard(message) {
      $('.menu').css('display', 'none');
      $('.gameBoard').css('display', 'block');
      $('#userHello').html(message);
      kira_theme.stop();
      this.createGameBoard(); //function above
      //Game.createGameBoard()
      FoC_theme.play();
    }
    /**
     * Update game board UI
     *
     * @param {string} type Type of player(X or O)
     * @param {int} row Row in which move was played
     * @param {int} col Col in which move was played
     * @param {string} tile Id of the the that was clicked
     */
    updateBoard(line) {
      $('#display').html(line);
    }

    getRoomId() {
      return this.roomId;
    }

    // Send an update to the opponent to update their UI's tile
    playTurn(line) {
      //get string id of button eg. button_01

      // Emit an event to update other player that you've played your turn.

      socket.emit('playTurn', {
        line: line,
        room: this.getRoomId(),
      });
    }

    checkEnd() {

      socket.emit('gameEnded', {
          room: this.getRoomId(),
          score: player.getScore(),
        });


    }

    // Announce the winner if the current client has won.
    // Broadcast this on the room to let the opponent know
    // End the game if the other player won.
    endGame(message) {
      alert(message);
      location.reload();
      //reload to menu
    }
  }
  /////////////////FIN Game class//////////////////////

  /////////////////Button function//////////////////////
  // Create a new game. Emit newGame event.
  $('#new').on('click', () => {
    //get value from input in html
    socket.emit('ping',{});
    const name = $('#nameNew').val();
    if (!name) {
      alert('Please enter your name.');
      return;
    }
    //eg. name:'Kat'
    socket.emit('createGame', { name });
    player = new Player(name, P1);
     });

  // Join an existing game on the entered roomId. Emit the joinGame event.
  $('#join').on('click', () => {
    const name = $('#nameNew').val();
    const roomID = $('#room').val();
    //eg. room-1
    if (!name || !roomID) {
      alert('Please enter your name and game ID.');
      return;
    }
    socket.emit('joinGame', { name, room: roomID });
    //eg. roomID = 'room-1'
    player = new Player(name, P2);
  });

  /////Modal/////
  $(`#modal_rematchRequestYes`).on('click', function() {
    socket.emit('rematchRequest',{room: game.getRoomId(), rematch: true});
    timer.stopAndReset();
    
    document.getElementById('modal_rematchRequest').style.display='none';
  });
  $(`#modal_rematchRequestNo`).on('click', function() {
    socket.emit('rematchRequest',{room: game.getRoomId(), rematch: false});
    timer.stopAndReset();
    
    document.getElementById('modal_rematchRequest').style.display='none';
  });

  $(`#modal_replyForRematchYes`).on('click', function() {
    socket.emit('rematchReply',{room: game.getRoomId(), rematch: true, oppWinStatus:oppWinStatus});
    timer.stopAndReset();
    console.log('yes');
    
    document.getElementById('modal_replyForRematch').style.display='none';
  });
  $(`#modal_replyForRematchNo`).on('click', function() {
    socket.emit('rematchReply',{room: game.getRoomId(), rematch: false, oppWinStatus:oppWinStatus});
    timer.stopAndReset();
    
    document.getElementById('modal_replyForRematch').style.display='none';
  });

  /////FIN Modal/////
  /////////////////FIN Button function//////////////////////

  /////////////////Socket events//////////////////////
  // New Game created by current client. Update the UI and create new Game var.
  socket.on('newGame', (data) => {
    const message =
      `Hello, ${data.name}. Please ask your friend to enter Game ID:
      ${data.room}. Waiting for player 2...`;

    // Create game for player 1
    game = new Game(data.room);

    //room variable with string room name
    game.displayBoard(message);
    player.setCurrentTurn(false);
  });

  /**
	 * If player creates the game, he'll be P1(X) and has the first turn.
	 * This event is received when opponent connects to the room.
	 */
  socket.on('player1', (data) => {
    const message = `Hello, ${player.getPlayerName()}`;
    $('#userHello').html(message);
    if(!game){
        game = new Game(data.room);

        game.displayBoard(message);
      }

      game.moves = 0;
      player.score = 0;
      player.setReceiver(false);
      timer.stopAndReset();

    player.setCurrentTurn(true);
    timer.setAndStart('make');
    console.log("Player 1 activated");
    
  });

  /**
	 * Joined the game, so player is P2(O).
	 * This event is received when P2 successfully joins the game room.
	 */
  socket.on('player2', (data) => {
    const message = `Hello, ${data.name}`;
      $(`#hihi`).text('Player2 regis');
    // Create game for player 2
  if(!game){
      game = new Game(data.room);

      game.displayBoard(message);
    }

    game.moves = 0;
    player.score = 0;
    player.setReceiver(false);
    timer.stopAndReset();

    game.moves -= 1;
    player.setCurrentTurn(false);
  });

  /**
	 * Opponent played his turn. Update UI.
	 * Allow the current player to play now.
	 */
   //tile.split('_') gives an array eg.button_21 will give ['button','21']
   //from index.js, passes tile: data.tile, room: data.room
  socket.on('turnPlayed', (data) => {
    //updateBoard after turnPlayed
    socket.emit('ping',{});
    $(`#hihi`).text('Success 3');
    animateAndSetReceiver(data.line.split(''));
    game.updateBoard(data.line);


    //player can now click submit
  });

  // If the other player wins, this event is received. Notify user game has ended.
  socket.on('gameEnd', (data) => {
    game.endGame(data.message);
    socket.leave(data.room);
  });

  socket.on('evalScore', (data) => {
    $('#turn').text('The game has ended.');
    var yourScore = player.getScore();
    var oppScore = data.oppScore;
    $('#hihi').text(''+yourScore+', '+oppScore);
   
  if(yourScore>oppScore){
    $('#meme_result').html('Winner Winner Chicken Dinner');
			$('#meme_message').html('เก่งดีนี่...');
    $('#userHello').html("You win");
    oppWinStatus='L';
  }else if(yourScore<oppScore){
    $('#meme_result').html('You lose');
		$('#meme_message').html("Don't hate the game, hate the player.");
			
    oppWinStatus='W';
  }else{
    $('#meme_result').html('You tie');
		$('#meme_message').html('you are both noobs.');
			oppWinStatus='T';
  }
  
  document.getElementById('modal_WaitForRematch').style.display='block';

  socket.emit('announceWinner',{oppWinStatus:oppWinStatus,room:game.getRoomId()});
  });

  socket.on('evalScore2',(data)=>{
      $('#turn').text('The game has ended.');

      var winStatus = data.oppWinStatus;
      var result = '';
      var message='';
      if(winStatus =='W'){
        result = 'Winner Winner Chicken Dinner';
		  	message = 'เก่งดีนี่...';
		 }else if(winStatus =='L'){
        result = 'You lose';
		    message = "Don't hate the game, hate the player.";
		 }else{
        result = 'You tie';
			  message = 'you are both noobs.';
		 }
  
      
    
      document.getElementById('modal_rematchRequest').style.display='block';
      timer.setAndStart('rematchRequest');
      $('#meme_result').html(result);
      $('#meme_message').html(message);
  });

  	//for replying score back to live score.
	socket.on('serverToOppScore', data => {
		$('#score_opp').text(data.senderScore);
		socket.emit('oppScoreBackToServer', { responseScore: player.getScore(), room: game.getRoomId() });
	});
	socket.on('updateOppScore', data => {
		$('#score_opp').html(data.oppScore);
	});


  socket.on('reset',() => {
  alert("You've been reset boi!");
});
  /**
	 * End the game on any err event.
	 */
  socket.on('err', (data) => {
    alert(data.message);
  });

  /** Rematch events */
  socket.on('rematchRequestReply',(data)=>{
    console.log('rematchRequestReply');
    document.getElementById('modal_WaitForRematch').style.display='none';
    timer.setAndStart("rematchReply");
    $('#modalReplyForRematch').modal('show');
    if(data.rematch){
      document.getElementById('modal_replyForRematch').style.display='block';
    
    }else{
      alert('Your opponent left');
    }
  })

  socket.on('rematchReplyNo',()=>{
    alert('Your opponent left');
  });

/////////////////FIN Socket events//////////////////////
  /**Timer*/
  /*Stopwatch class (via var timerAnimate) refers to the actual timer countdown animation,
  while Timer class handles timeout actions*/

  var reset;
  class Timer{
    constructor(){
      this.action='';
      this.time=90;

    }
    setAndStart(action){

      this.setAction(action);
      if(action=='make'){
        this.startTimer(10000);
        return;
      }
      if(action=='follow'){
        this.startTimer(20000);
        return;
      }
      //default
      this.startTimer(30000);
      
    }
    setAction(action){
      this.action=action;
    }
    stopAndReset(){
      timerAnimate.reset();
      timerAnimate.stop();
      this.reset();
    }
    startTimer(time){
      // timerAnimate.start();
      this.time=time;
      this.startTimerCountDown(time);
      reset =  window.setTimeout(this.doWhenTimeOut.bind(this),this.time);
    }
    startTimerCountDown(time){
      timerAnimate.setTime(time);
      timerAnimate.timeDecrease();
    }
    reset(){
      if (typeof reset != "undefined")
      {window.clearTimeout(reset);}
    }

    doWhenTimeOut(){
      alert('Timeout '+this.action+this.time);
      this.stopAndReset();
      if(this.action=='make'){
        game.playTurn('11111');

        //update my board
        game.updateBoard('11111');
        player.setCurrentTurn(false);
      }
      if(this.action =='follow'){
        game.moves++;
        player.setReceiver(false);
        if(game.moves == 2){
          player.setCurrentTurn(false);
          game.checkEnd();
          return;
        }
        $('#turn').text('Its your turn to type something for them to copy!');
        timer.setAndStart('make');


        return;
      }
    if(this.action == 'rematchRequest'){
      socket.emit('rematchRequest',{room: game.getRoomId(), rematch: false});
    }
    if(this.action == 'rematchReply'){
      socket.emit('rematchReply',{room: game.getRoomId(), rematch: false, oppWinStatus:oppWinStatus});
    }
    }
  }


  //timer
  var Stopwatch = function(elem, options) {
  	var timer = createTimer(),
  		// startButton = createButton('start', start),
  		// stopButton = createButton('stop', stop),
  		// resetButton = createButton('reset', reset),
  	offset,
  	clock,
		interval;

  	// default options
  	options = options || {};
  	options.delay = options.delay || 1;

  	// append elements
  	elem.appendChild(timer);
  	// elem.appendChild(startButton);
  	// elem.appendChild(stopButton);
  	// elem.appendChild(resetButton);

  	// initialize
  	reset();

  	// private functions
  	function createTimer() {
  		return document.createElement('span');
  	}

  	function createButton(action, handler) {
  		var a = document.createElement('a');
  		a.href = '#' + action;
  		a.innerHTML = action;
  		a.addEventListener('click', function(event) {
  			handler();
  			event.preventDefault();
  		});
  		return a;
  	}

  	function start() {
  		if (!interval) {
  			offset = Date.now();
  			interval = setInterval(update, options.delay);
  		}
  	}

  	function stop() {
  		if (interval) {
  			clearInterval(interval);
  			interval = null;
  		}
  	}

  	function reset() {
  		clock = 0;
  		render();
  	}

  	function update() {
  		clock += delta();
  		render();
  	}

  	function render() {
  		timer.innerHTML = clock / 1000;
  	}

  	function delta() {
  		var now = Date.now(),
  			d = now - offset;

  		offset = now;
  		return d;
  	}

    function timeDecrease() {
      if (!interval) {
        offset = Date.now();
        interval = setInterval(unupdate, options.delay);
      }
    }

    function giveMeTime() {
  		return clock / 1000;
  	}

    function setTime(time) {
      clock = time;
      render();
     }

    function unupdate() {
      clock -= delta();
      render();
    }

  	// public API
  	this.start = start;
  	this.stop = stop;
  	this.reset = reset;
    this.timeDecrease = timeDecrease;
  	this.giveMeTime = giveMeTime;
    this.setTime = setTime;
  };


  var elems = document.getElementsByClassName('stopwatch');
  var timerAnimate;
  for (var i = 0, len = elems.length; i < len; i++) {
  	timerAnimate = new Stopwatch(elems[i]);
  }

  //easy language change with jquery
	//hard labor require at html page
	//language sent by the socket.
	$('[lang="th"]').hide();
	$('#switch-lang').click(function() {
		$('[lang="th"]').toggle();
		$('[lang="en"]').toggle();
	});
  //BGM
	//trying to kill you when start loading the page.
	var kira_theme = new Howl({
		src: ['dup-e/sfx/bgm/kira_theme.mp3'],
		preload: true,
		autoplay: true,
		loop: true,
	});
	//drawww monster cardoo.
	var FoC_theme = new Howl({
		src: ['dup-e/sfx/bgm/FoC_theme.mp3'],
		loop: true,
		volume: ['0.1'],
	});
	$('#muted_btn').on('click', () => {
		if ($('#muted_btn').hasClass('toggled')) {
			kira_theme.mute(false);
			FoC_theme.mute(false);
		} else {
			kira_theme.mute(true);
			FoC_theme.mute(true);
		}

		$('#muted_btn').toggleClass('toggled');
	});

	//Sound Effect
	var sound_do = new Howl({
		src: ['sfx/do.wav'],
	});
	var sound_re = new Howl({
		src: ['sfx/re.wav'],
	});
	var sound_mi = new Howl({
		src: ['sfx/mi.wav'],
	});
	var sound_fa = new Howl({
		src: ['sfx/fa.wav'],
	});
	var sound_sol = new Howl({
		src: ['sfx/sol.wav'],
	});
	var sound_la = new Howl({
		src: ['sfx/la.wav'],
	});
	var sound_si = new Howl({
		src: ['sfx/si.wav'],
	});

	function playBtnSound(num) {
		switch (num) {
			case 1:
				sound_do.play();
				break;
			case 2:
				sound_re.play();
				break;
			case 3:
				sound_mi.play();
				break;
			case 4:
				sound_fa.play();
				break;
			case 5:
				sound_sol.play();
				break;
			case 6:
				sound_la.play();
				break;
			case 7:
				sound_si.play();
				break;
		}
  }
  //for keypressed function
	async function press(e) {
		//console.log(`${e.key}`);
		switch (e.key) {
			case 'q':
				toggleColor('#playerbtn_1', 'btn-primary', 'btn-danger');
				await delay(200);
				toggleColor('#playerbtn_1', 'btn-danger', 'btn-primary');
				document.getElementById('playerbtn_1').click();
				break;
			case 'w':
				toggleColor('#playerbtn_2', 'btn-primary', 'btn-danger');
				await delay(200);
				toggleColor('#playerbtn_2', 'btn-danger', 'btn-primary');
				document.getElementById('playerbtn_2').click();
				break;
			case 'e':
				toggleColor('#playerbtn_3', 'btn-primary', 'btn-danger');
				await delay(200);
				toggleColor('#playerbtn_3', 'btn-danger', 'btn-primary');
				document.getElementById('playerbtn_3').click();
				break;
			case 'r':
				toggleColor('#playerbtn_4', 'btn-primary', 'btn-danger');
				await delay(200);
				toggleColor('#playerbtn_4', 'btn-danger', 'btn-primary');
				document.getElementById('playerbtn_4').click();
				break;
			case 't':
				toggleColor('#playerbtn_5', 'btn-primary', 'btn-danger');
				await delay(200);
				toggleColor('#playerbtn_5', 'btn-danger', 'btn-primary');
				document.getElementById('playerbtn_5').click();
				break;
			case 'y':
				toggleColor('#playerbtn_6', 'btn-primary', 'btn-danger');
				await delay(200);
				toggleColor('#playerbtn_6', 'btn-danger', 'btn-primary');
				document.getElementById('playerbtn_6').click();
				break;
			case 'u':
				toggleColor('#playerbtn_7', 'btn-primary', 'btn-danger');
				await delay(200);
				toggleColor('#playerbtn_7', 'btn-danger', 'btn-primary');
				document.getElementById('playerbtn_7').click();
				break;
		}
	}

}());
