(function init() {
  const socket = io.connect('/server');

  //Retrieving state
  //Page still has latest data upon refresh
  if (typeof(Storage) !== "undefined") {
    // Retrieve
    document.getElementById("usersOnline").innerHTML = localStorage.getItem("usersOnline");
    document.getElementById("playersOnline").innerHTML = localStorage.getItem("playersOnline");
    document.getElementById("IdRoomPlayer").innerHTML = localStorage.getItem("IdRoomPlayer");
  } else {
    document.getElementById("usersOnline").innerHTML = "Sorry, your browser does not support Web Storage...";
  }

  socket.on('usersOnline', (data) => {
    //Store state
    localStorage.setItem("usersOnline",data);
    //display data
    $('#usersOnline').html(data);
  });

  socket.on('playersOnline', (data) => {
    let message = JSON.stringify(data);
    //Store state
    localStorage.setItem("playersOnline",message);
    //display data
    $('#playersOnline').html(message);
  });

  socket.on('IdRoomPlayer', (data) => {
    let message = JSON.stringify(data);
    //Store state
    localStorage.setItem("IdRoomPlayer",message);
    //display data
    $('#IdRoomPlayer').html(message);
  });

  $('#reset').on('click', () => {
    const roomID = $('#room').val();
    //eg. room-1
    if (!roomID) {
      alert('Please enter your name and game ID.');
      return;
    }
    socket.emit('reset', { room: roomID });
  });

  let resetArray = [];

  socket.on('resetComplete',(data)=>{
    resetArray.push(data);
    let message = JSON.stringify(resetArray);
    $('#resetstatus').html(message);
  });

  socket.on('err', (data) => {
    alert(data.message);
  });
}());
