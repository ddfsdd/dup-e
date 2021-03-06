//Function immediately called
//alert(message) jQuery display alert box with message
(function init() {
	let player;
	let game;
	let timer;
	var makeMoveText = '';
	var followMoveText = '';
	var actualFollowMoveText = '';
	var oppWinStatus = '';
	const socket = io.connect('/game');
	var oppname = '';
	var oppScoreTest = 0;
	var roundNum = 2;

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
		$.notify(
			{
				title: '<strong>Incoming!:</strong> ',
				message: 'watch the pattern in 3 seconds.',
			},
			{
				type: 'warning',
			}
		);
		await delay(3000);
		for (i = 0; i < array.length; i++) {
			let ani_id = '#oppbtn_' + array[i];
			toggleColor(ani_id, 'btn-primary', 'btn-danger');
			await delay(400);
			toggleColor(ani_id, 'btn-danger', 'btn-primary');
			await delay(250);
		}
		$.notify(
			{
				title: '<strong>YOOO!:</strong> ',
				message: 'It is now your turn.',
			},
			{
				type: 'success',
			}
		);
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
		constructor(name) {
			this.name = name;
			this.currentTurn = false;
			this.score = 0;
			this.receiver = false;
		}
		updateScore(line, textTocheckWith) {
			var textTocheckWith = textTocheckWith.split('');
			var line = line.split('');
			var bonusMultiplier = 10;
			var combo = 0;
			var points = 0;
			var pernote = 50;
			for (let i = 0; i < line.length; i++) {
				if (i == textTocheckWith.length) {
					break;
				}
				if (textTocheckWith[i] == line[i]) {
					this.score += points + pernote + bonusMultiplier * combo;
					combo++;
				} else {
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

		setScore(score) {
			this.score = score;
		}

		// Set the currentTurn for player to turn and update UI to reflect the same.
		setCurrentTurn(turn) {
			this.currentTurn = turn;
			const message = turn ? 'Your turn' : 'Waiting for Opponent';
			$('#turn').text(message);
		}

		setReceiver(rcv) {
			this.receiver = rcv;
		}

		getReceiver() {
			return this.receiver;
		}

		getPlayerName() {
			return this.name;
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

					$.notify(
						{
							title: '<strong>Hold Up!!</strong> ',
							message: 'Its not your turn',
						},
						{
							type: 'danger',
						}
					);
					return;
				}

				//var line = $('#line').val();
				var textTocheckWith = $('#display').html();
				//comparison, score increases by input correct
				// //only for receiver
				if (player.getReceiver()) {
					actualFollowMoveText = (actualFollowMoveText + button).trim();
					if (actualFollowMoveText.split('').length == 5) {
						var line = actualFollowMoveText;

						player.updateScore(line, textTocheckWith);
						actualFollowMoveText = '';
						game.moves++;
						timer.stopAndReset();
						player.setReceiver(false);
						if (game.moves == roundNum) {
							player.setCurrentTurn(false);
							game.checkEnd();
							return;
						}
						$('#turn').text('Its your turn to type something for them to copy!');

						timer.setAndStart('make');
					}
					return;
				}

				makeMoveText = (makeMoveText + button).trim();
				console.log(makeMoveText);
				//tell server, tell opponent info, update their board
				if (makeMoveText.split('').length == 5) {
					var line = makeMoveText;
					game.playTurn(line);
					timer.stopAndReset();
					$.notify(
						{
							title: '<strong>Done:</strong> ',
							message: "Now Waiting for opponent Turn. <div class='loader'></div>",
						},
						{
							type: 'info',
						}
					);

					//update my board
					game.updateBoard(line);
					makeMoveText = '';
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

		updateBoard(line) {
			$('#display').html(line);
		}

		getRoomId() {
			return this.roomId;
		}

		// Send an update to the opponent to update their UI's tile
		playTurn(line) {
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
	}
	/////////////////FIN Game class//////////////////////

	/////////////////Button function//////////////////////
	// Create a new game. Emit newGame event.
	$('#new').on('click', () => {
		//get value from input in html
		const name = $('#nameNew').val();
		if (!name) {
			$.notify(
				{
					title: '<strong>Ummm....</strong> ',
					message: 'You forgot to input player name.',
				},
				{
					type: 'danger',
				}
			);

			return;
		}
		//eg. name:'Kat'
		console.log($('#roundNum').val());
		if ($('#roundNum').val() != '') {
			roundNum = parseInt($('#roundNum').val());
		}
		socket.emit('createGame', { name, roundNum: roundNum });
		player = new Player(name);
	});

	// Join an existing game on the entered roomId. Emit the joinGame event.
	$('#join').on('click', () => {
		const name = $('#nameNew').val();
		const roomID = $('#room').val();
		//eg. room-1
		if (!name || !roomID) {
			$.notify(
				{
					title: '<strong>Ummm....</strong> ',
					message: 'Either player name or room id are missing.',
				},
				{
					type: 'danger',
				}
			);
			return;
		}
		socket.emit('joinGame', { name, room: roomID });
		//eg. roomID = 'room-1'
		player = new Player(name);
	});

	/////Modal/////
	$(`#modal_rematchRequestYes`).on('click', function() {
		socket.emit('rematchRequest', { room: game.getRoomId(), rematch: true });
		timer.stopAndReset();
		document.getElementById('modal_rematchRequest').style.display = 'none';
	});
	$(`#modal_rematchRequestNo`).on('click', function() {
		socket.emit('rematchRequest', { room: game.getRoomId(), rematch: false });
		timer.stopAndReset();
		document.getElementById('modal_rematchRequest').style.display = 'none';
	});

	$(`#modal_replyForRematchYes`).on('click', function() {
		socket.emit('rematchReply', { room: game.getRoomId(), rematch: true, oppWinStatus: oppWinStatus });
		timer.stopAndReset();
		document.getElementById('modal_replyForRematch').style.display = 'none';
	});
	$(`#modal_replyForRematchNo`).on('click', function() {
		socket.emit('rematchReply', { room: game.getRoomId(), rematch: false, oppWinStatus: oppWinStatus });
		timer.stopAndReset();
		document.getElementById('modal_replyForRematch').style.display = 'none';
	});

	/////FIN Modal/////
	/////////////////FIN Button function//////////////////////

	/////////////////Socket events//////////////////////
	// New Game created by current client. Update the UI and create new Game var.
	socket.on('newGame', data => {
		const message = `Hello, ${data.name}. Please ask your friend to enter Game ID:
      ${data.room}. Waiting for player 2...`;

		// Create game for player 1
		game = new Game(data.room);

		//room variable with string room name
		game.displayBoard(message);
		player.setCurrentTurn(false);
	});

	socket.on('player1', data => {

		if (data.roundNum) {
			roundNum = data.roundNum;
			console.log(roundNum + 'P1');

		}
		if (!game) {
			game = new Game(data.room);

			game.displayBoard('');
		}

		$.notify(
			{
				title: '<strong>It is your turn: </strong> ',
				message: 'Type something for the opponent to follow.',
			},
			{
				type: 'success',
			}
		);
		game.moves = 0;
		player.score = 0;
		player.setReceiver(false);
		timer.stopAndReset();
		$('#score').text(player.getScore());
		socket.emit('updateScore', {
			senderScore: player.getScore(),
			room: game.getRoomId(),
		});

		player.setCurrentTurn(true);
		timer.setAndStart('make');
	});

	/**For playername registration */
	socket.on('regOppPlayerName', data => {
		console.log(data.name);

		oppname = data.name;
		var message = 'Hello ' + player.getPlayerName() + ', you are up against ' + data.name + '.';
		$('#userHello').html(message);
		socket.emit('regOppPlayerNameReply', { name: player.getPlayerName(), room: game.getRoomId() });
	});

	socket.on('regOppPlayerNameReply', data => {
		oppname = data.name;
		var message = 'Hello ' + player.getPlayerName() + ', you are up against ' + data.name + '.';
		$('#userHello').html(message);
	});

	socket.on('player2', data => {

		if (data.roundNum) {
			roundNum = data.roundNum;
		}
		console.log(roundNum + 'P2');

		// Create game for player 2
		if (!game) {
			game = new Game(data.room);

			game.displayBoard('');
		}
		$.notify(
			{
				title: '<strong>You start second: </strong> ',
				message: 'waiting for opponent to make move.<div class="loader"></div> ',
			},
			{
				type: 'info',
			}
		);
		game.moves = 0;
		player.score = 0;
		player.setReceiver(false);
		timer.stopAndReset();
		$('#score').text(player.getScore());
		socket.emit('updateScore', {
			senderScore: player.getScore(),
			room: game.getRoomId(),
		});

		game.moves -= 1;
		player.setCurrentTurn(false);
	});

	/**
	 * Opponent played his turn. Update UI.
	 * Allow the current player to play now.
	 */
	//tile.split('_') gives an array eg.button_21 will give ['button','21']
	//from index.js, passes tile: data.tile, room: data.room
	socket.on('turnPlayed', data => {
		//updateBoard after turnPlayed
		socket.emit('ping', {});
		animateAndSetReceiver(data.line.split(''));
		game.updateBoard(data.line);

		//player can now click submit
	});

	// If the other player wins, this event is received. Notify user game has ended.
	socket.on('gameEnd', data => {
		game.endGame(data.message);
		socket.leave(data.room);
	});

	socket.on('evalScore', data => {
		$('#turn').text('The game has ended.');
		var yourScore = player.getScore();
		var oppScore = data.oppScore;
		var winLoseTieText = yourScore > oppScore ? 'win' : yourScore < oppScore ? 'lose' : 'tie';
		const message = `'You, ${player.getPlayerName()}, ${winLoseTieText} against ${oppname} with your score of ${yourScore} vs ${oppScore}'`;
		if (yourScore > oppScore) {
			$('#meme_result').html('Winner Winner Chicken Dinner');
			$('#meme_message').html('เก่งดีนี่...');
			$('#userHello').html('You win');
			oppWinStatus = 'L';
		} else if (yourScore < oppScore) {
			$('#meme_result').html('You lose');
			$('#meme_message').html("Don't hate the game, hate the player.");

			oppWinStatus = 'W';
		} else {
			$('#meme_result').html('You tie');
			$('#meme_message').html('you are both noobs.');
			oppWinStatus = 'T';
		}

		document.getElementById('modal_WaitForRematch').style.display = 'block';
		$('#modal_WaitForRematchBody1').text('Please Wait for rematch. \n' + message);

		$('#modal_replyForRematchBody1').text('Say yes to rematch, winner goes first. \n' + message);
		socket.emit('announceWinner', { oppWinStatus: oppWinStatus, room: game.getRoomId() });
	});

	socket.on('evalScore2', data => {
		var yourScore = player.getScore();
		$('#turn').text('The game has ended.');
		var winLoseTieText = yourScore > oppScore ? 'win' : yourScore < oppScoreTest ? 'lose' : 'tie';
		const message2 = `'You, ${player.getPlayerName()}, ${winLoseTieText} against ${oppname} with your score of ${yourScore} vs ${oppScoreTest}'`;

		var winStatus = data.oppWinStatus;
		var result = '';
		var message = '';
		if (winStatus == 'W') {
			result = 'Winner Winner Chicken Dinner';
			message = 'เก่งดีนี่...';
		} else if (winStatus == 'L') {
			result = 'You lose';
			message = "Don't hate the game, hate the player.";
		} else {
			result = 'You tie';
			message = 'you are both noobs.';
		}

		$('#modal_rematchRequestBody1').text('Say yes to rematch, winner goes first. \n' + message2);
		document.getElementById('modal_rematchRequest').style.display = 'block';
		timer.setAndStart('rematchRequest');
		$('#meme_result').html(result);
		$('#meme_message').html(message);
	});

	//for replying score back to live score.

	socket.on('serverToOppScore', data => {
		$('#score_opp').text(data.senderScore);
		socket.emit('oppScoreBackToServer', { responseScore: player.getScore(), room: game.getRoomId() });
		oppScore = data.senderScore;
		console.log('oppScore ' + oppScore);
	});
	socket.on('updateOppScore', data => {
		$('#score_opp').html(data.oppScore);
		oppScoreTest = data.oppScore;
		console.log('oppScore ' + oppScore);
	});

	socket.on('reset', () => {
		alert("You've been reset boi!");
	});

	socket.on('resetScore', data => {
		alert("You're score is reset to " + data.score);
		player.score = parseInt(data.score);
		$('#score').text(player.getScore());
		//for live score update
		socket.emit('updateScore', {
			senderScore: player.getScore(),
			room: game.getRoomId(),
		});
		socket.emit('resetScoreRcvd', { score: player.getScore() });
	});
	/**
	 * End the game on any err event.
	 */
	socket.on('err', data => {
		alert(data.message);
	});

	/** Rematch events */
	socket.on('rematchRequestReply', data => {
		console.log('rematchRequestReply');
		document.getElementById('modal_WaitForRematch').style.display = 'none';

		if (data.rematch) {
			timer.setAndStart('rematchReply');
			document.getElementById('modal_replyForRematch').style.display = 'block';
		} else {
			alert('Your opponent left');
		}
	});

	socket.on('rematchReplyNo', () => {
		alert('Your opponent left');
	});

	/////////////////FIN Socket events//////////////////////
	/**Timer*/
	/*Stopwatch class (via var timerAnimate) refers to the actual timer countdown animation,
  while Timer class handles timeout actions*/
	var modalTimeOutBody = $('#modal_TimeoutBody');
	var modalTimeOut = document.getElementById('modal_Timeout');
	var reset;
	class Timer {
		constructor() {
			this.action = '';
			this.time = 90;
		}
		setAndStart(action) {
			this.setAction(action);
			if (action == 'make') {
				this.startTimer(10000);
				return;
			}
			if (action == 'follow') {
				this.startTimer(20000);
				return;
			}
			//default
			this.startTimer(30000);
		}
		setAction(action) {
			this.action = action;
		}
		stopAndReset() {
			timerAnimate.reset();
			timerAnimate.stop();
			this.reset();
		}
		startTimer(time) {
			// timerAnimate.start();
			this.time = time;
			this.startTimerCountDown(time);
			reset = window.setTimeout(this.doWhenTimeOut.bind(this), this.time);
		}
		startTimerCountDown(time) {
			timerAnimate.setTime(time);
			timerAnimate.timeDecrease();
		}
		reset() {
			if (typeof reset != 'undefined') {
				window.clearTimeout(reset);
			}
		}

		doWhenTimeOut() {
			$('#modal_TimeoutBody').text('Timeout: ' + this.action + ', Duration: ' + this.time + 'ms');
			document.getElementById('modal_Timeout').style.display = 'block';
			$.notify(
				{
					title: '<strong>TIME UPPPSS!!: </strong> ',
					message: 'Pay attention next time, waiting for opponent to make move.<div class="loader"></div> ',
				},
				{
					type: 'info',
				}
			);
			this.stopAndReset();
			if (this.action == 'make') {
				game.playTurn('11111');

				//update my board
				game.updateBoard('11111');
				player.setCurrentTurn(false);
			}
			if (this.action == 'follow') {
				game.moves++;
				player.setReceiver(false);
				if (game.moves == roundNum) {
					player.setCurrentTurn(false);
					game.checkEnd();
					return;
				}
				$('#turn').text('Its your turn to type something for them to copy!');
				timer.setAndStart('make');

				return;
			}
			if (this.action == 'rematchRequest') {
				socket.emit('rematchRequest', { room: game.getRoomId(), rematch: false });
			}
			if (this.action == 'rematchReply') {
				socket.emit('rematchReply', { room: game.getRoomId(), rematch: false, oppWinStatus: oppWinStatus });
			}
		}
	}

	//timer
	var Stopwatch = function(elem, options) {
		var timer = createTimer(),
			offset,
			clock,
			interval;

		// default options
		options = options || {};
		options.delay = options.delay || 1;

		// append elements
		elem.appendChild(timer);

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
		src: ['sfx/kira_theme.mp3'],
		preload: true,
		autoplay: true,
		loop: true,
		volume: 0.2,
	});
	//drawww monster cardoo.
	var FoC_theme = new Howl({
		src: ['sfx/FoC_theme.mp3'],
		loop: true,
		volume: 0.1,
	});
	$('#muted_btn').on('click', () => {
		if ($('#muted_btn').hasClass('toggled')) {
			$('.btn_img').attr('src', 'pic/symbol/unmuted.png');
			kira_theme.mute(false);
			FoC_theme.mute(false);
		} else {
			$('.btn_img').attr('src', '/pic/symbol/muted.png');
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

})();
