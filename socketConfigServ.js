module.exports = function(server) {
  var io = require('socket.io').listen(server);
  var game_sockets = {};
  var controller_sockets = {};

  io.sockets.on('connection', function(socket) {

    //////////////////////////////
    /// GAME CLIENT CONNECTION ///
    //////////////////////////////
    
    socket.on('game_connect', function() {
      console.log('Game client with id ' + socket.id + ' connected');

      game_sockets[socket.id] = {
        socket: socket,
        controller_id: undefined
      };

      socket.emit('game_connected');
    });

    ////////////////////////////////////
    /// CONTROLLER CLIENT CONNECTION ///
    ////////////////////////////////////
    
    socket.on('controller_connect', function(game_socket_id) {

      if(game_sockets[game_socket_id] && !game_sockets[game_socket_id].controller_id) {

        console.log('Controller client with id ' + socket.id + ' connected');

        controller_sockets[socket.id] = {
          socket: socket,
          game_id: game_socket_id
        };

        game_sockets[game_socket_id].controller_id = socket.id;

        game_sockets[game_socket_id].socket.emit('controller_connected', true); // TODO - sends the event to game client also

        // Forward the changes onto the relative game socket
        socket.on('controller_state_change', function(data) {

          if(game_sockets[game_socket_id]) {

            // Notify relevant game socket of controller state change
            game_sockets[game_socket_id].socket.emit('controller_state_change', data);
          }
        });

        socket.emit('controller_connected', true);

      } else {

        console.log('Controller tried to connect but failed');

        socket.emit('controller_connected', false);

      }
    });

    /////////////////////
    /// DISCONNECTING ///
    /////////////////////
    
    socket.on('disconnect', function() {

      //////////////////////////////
      /// GAME CLIENT DISCONNECT ///
      //////////////////////////////
      
      if(game_sockets[socket.id]) {

        console.log('Game client with id ' + socket.id + ' disconnected');

        if(controller_sockets[game_sockets[socket.id].controller_id]) {

          controller_sockets[game_sockets[socket.id].controller_id].game_id = undefined;
          controller_sockets[game_sockets[socket.id].controller_id].socket.emit('controller_connected', false);
        }

        delete game_sockets[socket.id];
      }

      ////////////////////////////////////
      /// CONTROLLER CLIENT DISCONNECT ///
      ////////////////////////////////////
      
      if(controller_sockets[socket.id]) {

        console.log('Controller client with id ' + socket.id + ' disconnected');

        if(game_sockets[controller_sockets[socket.id].game_id]) {

          game_sockets[controller_sockets[socket.id].game_id].socket.emit('controller_connected', false);
          game_sockets[controller_sockets[socket.id].game_id].controller_id = undefined;
        }

        delete controller_sockets[socket.id];
      }
    });
  });
}