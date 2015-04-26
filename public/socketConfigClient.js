var io = io.connect();

var game_connected = function() {
  var url = 'http://polar-fjord-9679.herokuapp.com/?id=' + io.id;
  
  var qr_code = new QRCode('qr');
  qr_code.makeCode(url);

  io.removeListener('game_connected', game_connected);
};

//////////////
/// Events ///
//////////////

if (window.location.href.indexOf('?id=') > 0) {

  io.emit('controller_connect', window.location.href.split('?id=')[1]);

} else {

  io.on('connect', function() {
    io.emit('game_connect');
  });

}

io.on('controller_connected', function(connected) {
  if(connected) {
    
    qr.style.display = 'none';

    var controller_state = {
      accelerate: false,
      steer: 0
    },
    emit_updates = function(){
      io.emit('controller_state_change', controller_state);
    }
    touchstart = function(e){
      e.preventDefault();
      e.stopPropagation();
      e.cancelBubble = true;
      e.returnValue = false;

      console.log('clicked');

      e.preventDefault();
      controller_state.accelerate = true;
      emit_updates();
    },
    touchend = function(e){
      e.preventDefault && e.preventDefault();
      e.stopPropagation && e.stopPropagation();
      e.cancelBubble = true;
      e.returnValue = false;

      e.preventDefault();
      controller_state.accelerate = false;
      emit_updates();
    },
    devicemotion = function(e){
      controller_state.steer = e.accelerationIncludingGravity.y / 100;

      emit_updates();
    }

    document.body.addEventListener('mousedown', touchstart, false);
    document.body.addEventListener('touchstart', touchstart, false); // iOS & Android
    document.body.addEventListener('MSPointerDown', touchstart, false); // Windows Phone
    document.body.addEventListener('mouseup', touchend, false);
    document.body.addEventListener('touchend', touchend, false); // iOS & Android
    document.body.addEventListener('MSPointerUp', touchend, false); // Windows Phone
    window.addEventListener('devicemotion', devicemotion, false);

  } else {
    
    qr.style.display = 'block';
    controller_state = {};

  }
});

// When the server sends a changed controller state update it in the game
io.on('controller_state_change', function(state) {

  controller_state = state;

});

io.on('game_connected', game_connected);