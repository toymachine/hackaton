

var app = require('express').createServer() , express = require('express') , io = require('socket.io').listen(app);

app.configure(function(){
    app.use(express.static(__dirname));
    app.use(express.bodyParser());
});

app.listen(9090);

app.get('/', function (req, res) {
    res.sendfile(__dirname + '/physics.html'); 
}); 



function new_session() {
    return {
	red: false,
	blue: false,
	started: false
    }
}

var session = new_session();

io.sockets.on('connection', function (socket) {

    //socket.emit('news', { hello: 'world' });

    socket.on('hello', function (data) {
	if(session.red === false) {
	    session.red = socket;
	}
	else if(session.blue === false) {
	    session.blue = socket;
	}
	else {
	    socket.emit('cannot_play');
	}

	if(session.red !== false && session.blue !== false && session.started === false) {
	    
	    obstacles = [];
	    for(i = 0; i < 5; i++) {
		obstacles.push({
		    radius: (Math.random() * 2 / 2) + 1,
		    x: Math.random() * 20 - 5,
		    y: 6 + 6 * i,
		    z: Math.random() * 20 - 20
		});
	    }

	    session.started = true;
	    session.red.emit('start', {
		player: 'red',
		obstacles: obstacles
	    });
	    session.blue.emit('start', {
		player: 'blue',
		obstacles: obstacles
	    });
	}
    });

    socket.on('key_up', function(data) {
	if(session.red === socket) {
	    session.blue.emit('key_up', data);
	}
	else if(session.blue === socket) {
	    session.red.emit('key_up', data);
	}
    });

    socket.on('key_down', function(data) {
	if(session.red === socket) {
	    session.blue.emit('key_down', data);
	}
	else if(session.blue === socket) {
	    session.red.emit('key_down', data);
	}
    });

    socket.on('disconnect', function() {
	if(session.red === socket) {
	    if(session.blue !== false) {
		session.blue.emit('reset');
	    }
	    session = new_session();
	}
	else if(session.blue === socket) {
	    if(session.red !== false) {
		session.red.emit('reset');
	    }
	    session = new_session();
	}
	
    })
});