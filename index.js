const express = require('express');
const path = require('path');

const app = express();
//reference to express module is a function
//express module can be used to create several apps

const server = require('http').Server(app);
//server is a class in http module
//server object is made and executes app everytime it gets a request

const io = require('socket.io')(server);
//connect server to socket.io

let rooms = 0;

app.use(express.static('.'));

//for http request localhost:5000/game
app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, 'home.html'));
});

app.get('/game', (req, res) => {
	res.sendFile(path.join(__dirname, 'game.html'));
});

//for http request localhost:5000/server
app.get('/server', (req, res) => {
	res.sendFile(path.join(__dirname, 'serverapp.html'));
});

//array for tracking every access into page
let usersOnline = [];
//object tracking players in created rooms
let playersOnline = {};
//object tracking id (a socket connection),room,player name
let IdRoomPlayer = {};
function findAnEmptyRoom(){
	for(roomnum of Object.keys(playersOnline)){
		console.log(roomnum);
		
		console.log('Testing room system'+ playersOnline[roomnum]);
		
		if(playersOnline[roomnum].length==0){
			return roomnum;
		}
	}
	return '';
}
//connect with serverapp.js
var serverapp = io.of('/server');
serverapp.on('connection', socket => {
	console.log('Server App Opened');
	socket.on('reset', data => {
		//client.to(data.room).emit('reset');
		var roomSocket = client.adapter.rooms[data.room].sockets;
		console.log(Object.keys(roomSocket));
		var clientInRoom = Object.keys(roomSocket);
		console.log(`reset ${data.room}`);
		var whoFirst = Math.floor(Math.random() * 2);
		console.log(clientInRoom[0]);
		client.to(clientInRoom[0]).emit('reset');
		client.to(clientInRoom[1]).emit('reset');
		if (whoFirst === 0) {
			//broadcast.to= to other player
			//emit is to the player that calls the event
			client.to(clientInRoom[0]).emit('player1', {});
			client.to(clientInRoom[1]).emit('player2', {});
		} else {
			client.to(clientInRoom[1]).emit('player1', {});
			client.to(clientInRoom[0]).emit('player2', {});
		}
  });
  
  socket.on('resetScore', (data) => {
    
    var roomSocket = client.adapter.rooms[data.room].sockets;
    var clientInRoom = Object.keys(roomSocket);
    if(IdRoomPlayer[clientInRoom[0]][1] == data.name){
      client.to(clientInRoom[0]).emit('resetScore',{score: data.score});
    }
    if(IdRoomPlayer[clientInRoom[1]][1] == data.name){
      client.to(clientInRoom[1]).emit('resetScore',{score: data.score});
    }
    else{
      console.log('Name does not exist');
    }
  });


});

//connect with main.js
var client = io.of('/game');
//when there's a connection from a client
client.on('connection', socket => {
	let length = usersOnline.push(socket);
	//eg. socket.id = 5oYZNCfuCkeVPfC0AAAA, new one for every page reload

	console.log('Number of people accessing web: ' + length);
	serverapp.emit('usersOnline', length);
	//socket.on('event',function) executes funtion when event is triggered
	//socket.emit('event',data) emits data to client who invoked event
	//socket.broadcast.to(room) broadcast event to everyone in room except person who sent the event

	//if user leaves page
	socket.on('disconnect', function() {
		var i = usersOnline.indexOf(socket);
		usersOnline.splice(i, 1);
		socket.id;
		console.log('Number of people accessing web: ' + usersOnline.length);
		serverapp.emit('usersOnline', usersOnline.length);

		let roomnum = 0;
		let playername;
		//if there is a socket id in the object
		//to prevent crash
		if (IdRoomPlayer[socket.id]) {
			roomnum = IdRoomPlayer[socket.id][0];
			playername = IdRoomPlayer[socket.id][1];
			//if there is a room in the object
			//to prevent crash
			if (playersOnline[roomnum]) {
				i = playersOnline[roomnum].indexOf(playername);
				playersOnline[roomnum].splice(i, 1);
			}
		}
		console.log(IdRoomPlayer);
		serverapp.emit('IdRoomPlayer', IdRoomPlayer);
		console.log(playersOnline);
		serverapp.emit('playersOnline', playersOnline);
	});

	// Create a new game room and notify the creator of game.
	//data that is passed into emit event 'createGame' is passed to here
	socket.on('createGame', data => {
		var room = findAnEmptyRoom();
		if(room==''){
			socket.join(`room-${++rooms}`);
			room = `room-${rooms}`;
		}else{
			socket.join(room);
		}

		//update playersOnline
		//store socket id for that session with player name
		IdRoomPlayer[socket.id] = [room, data.name];
		playersOnline[room] = [data.name];
		console.log(IdRoomPlayer);
		serverapp.emit('IdRoomPlayer', IdRoomPlayer);
		console.log(playersOnline);
		serverapp.emit('playersOnline', playersOnline);

		//joining room in socket with string room name
		socket.emit('newGame', { name: data.name, room: room });
	});

	// Connect the Player 2 to the room he requested. Show error if room full.
	socket.on('joinGame', function(data) {
		var room = io.nsps['/game'].adapter.rooms[data.room];
		//access object property via rooms['key']
		if (room && room.length === 1) {
			socket.join(data.room);

			//update playersOnline
			//store socket id for that session with player name
			IdRoomPlayer[socket.id] = [data.room, data.name];
			playersOnline[data.room].push(data.name);
			console.log(IdRoomPlayer);
			serverapp.emit('IdRoomPlayer', IdRoomPlayer);
			console.log(playersOnline);
			serverapp.emit('playersOnline', playersOnline);

			var whoFirst = Math.floor(Math.random() * 2);
			console.log(whoFirst);

			socket.broadcast.to(data.room).emit('regOppPlayerName',{name: data.name});
	
			if (whoFirst === 0) {
				//broadcast.to= to other player
				//emit is to the player that calls the event
				socket.broadcast.to(data.room).emit('player1', {room:data.room});
				socket.emit('player2',{room:data.room});
			} else {
				socket.broadcast.to(data.room).emit('player2', {room:data.room});
				socket.emit('player1',{room:data.room});
			}
	} else {
			socket.emit('err', { message: 'Sorry, The room is full!' });
		}
	});


	socket.on('regOppPlayerNameReply',(data)=>{
		socket.broadcast.to(data.room).emit('regOppPlayerNameReply',{name: data.name});
		
	})
	/**
	 * Handle the turn played by either player and notify the other.
	 */
	socket.on('playTurn', data => {
		console.log('hihi');
		socket.broadcast.to(data.room).emit('turnPlayed', {
			line: data.line,
		});
		console.log(data.room);
	});
	socket.on('ping', data => {
		console.log('hihi-ping');
	});
	/**
	 * Notify the players about the victor.
	 */

	//for live score update
	socket.on('updateScore', data => {
		socket.broadcast.to(data.room).emit('serverToOppScore', { senderScore: data.senderScore });
	});
	socket.on('oppScoreBackToServer', data => {
		socket.broadcast.to(data.room).emit('updateOppScore', { oppScore: data.responseScore });
	});

	socket.on('gameEnded', data => {
		//evaluate winner
		socket.broadcast.to(data.room).emit('evalScore', { oppScore: data.score });
		console.log(data.score);
	});

	// socket.on('evalScore', (data2) => {
	//   console.log('score gottwn.');
	//   let winner = data.score > data2.score ? 'player 1':'player 2';
	//   const m = `The Winner is ${winner}`;
	//   //tell two players at the same time who is the winner
	//   socket.broadcast.to(data.room).emit('gameEnd',{message:m});
	//   socket.emit('gameEnd',{message:m});
	// });

	socket.on('announceWinner', data => {
		socket.broadcast.to(data.room).emit('evalScore2', { oppWinStatus: data.oppWinStatus });

		//remove room and its players out of playersOnline & update
		delete playersOnline[data.room];
		console.log(playersOnline);
		serverapp.emit('playersOnline', playersOnline);
	});
  socket.on('resetRcvd',()=>{
    let message = 'reset received! by '+socket.id;
    console.log(message);
    serverapp.emit('resetComplete',message);
  });

  socket.on('resetScoreRcvd',(data)=>{
    let message = 'reset received! by '+socket.id+' the score is '+data.score;
    console.log(message);
    serverapp.emit('resetScoreComplete',message);
  });
	//added
	socket.on('rematchRequest', data => {
		console.log('forwarding rematch' + data.room);
		socket.broadcast.to(data.room).emit('rematchRequestReply', { rematch: data.rematch });
	});
	socket.on('rematchReply', data => {
		console.log('forwarding reply');
		if (data.rematch == true) {
			if (data.oppWinStatus == 'W') {
				socket.broadcast.to(data.room).emit('player1', {});
				socket.emit('player2', { name: data.name, room: data.room });
			} else {
				socket.broadcast.to(data.room).emit('player2', {});
				socket.emit('player1', { name: data.name, room: data.room });
			}
		} else {
			socket.broadcast.to(data.room).emit('rematchReplyNo', {});
		}
	});
});
let port = process.env.PORT;
if (port == null || port == '') {
	port = 5000;
}
server.listen(port);
