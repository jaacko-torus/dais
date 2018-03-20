/* debug */

const DEBUG = false;

/* routing */

// var express = require('express');
// var app     = express();
// var server  = require('http').createServer(app);
// var io      = require('socket.io').listen(server);

var express = require("express");
var app = express();
var server = require("http").Server(app);

app.get("/", function(req, res) {
	res.sendFile( __dirname + "/client/index.html" );
});

app.use(express.static("client"));

server.listen(process.env.PORT || 8080);
console.log("Server started.");


// ------------------------------------------------------------


/* world methods */

var world = {
	size: 21,
	make(width, height, layer, socket) {
		this.map = [];
		
		for(let l = 0; l < layer; l++) {
			this.map.push([])
			for(let y = 0; y < height; y++) {
				this.map[l].push([]);
				for(let x = 0; x < width; x++) {
					this.map[0][y].push( 5 );
					if(l) { this.map[l][y].push( undefined ) }
				}
			}
		}
		
		if( socket ) { socket.emit("new_map", this.map) }
		return this.map;
	},
	find(x, y) {
		return this.map[y - 1][x - 1];
	}
};



// ------------------------------------------------------------



/* classes */

class entity {
	constructor(img, x = 1, y = 1, spd_x = 0, spd_y = 0) {
		this.x = x;
		this.y = y;
		
		this.spd_x = spd_x;
		this.spd_y = spd_y;
		
		this.img = img;
		
		this.size = 16;
	}
	
	update() {
		this.update_position();
	}
	
	update_position() {
		this.x += this.spd_x;
		this.y += this.spd_y;
	}
}

var PLAYER_LIST = {};

class player extends entity {
	constructor(x, y, spd_x, spd_y, img = 0) {
		super(img, x, y, spd_x, spd_y);
		
		this.spd = 1;
		
		this.pressing = {
			left  : false,
			up    : false,
			right : false,
			down  : false
		};
	}
	
	update() {
		this.update_spd();
		super.update();
	}
	
	update_spd() {
		if( this.pressing.left  ) { this.spd_x = -this.spd }
		if( this.pressing.up    ) { this.spd_y = -this.spd }
		if( this.pressing.right ) { this.spd_x =  this.spd }
		if( this.pressing.down  ) { this.spd_y =  this.spd }
		
		if( !( this.pressing.left || this.pressing.right ) ) { this.spd_x = 0; }
		if( !( this.pressing.up   || this.pressing.down  ) ) { this.spd_y = 0; }
	}
	
	on_connect(socket, id) {
		PLAYER_LIST[id] = this;
		
		socket.on("key_press", (data) => {
			if( data.input_id === "left"  ) { this.pressing.left  = data.state }
			if( data.input_id === "up"    ) { this.pressing.up    = data.state }
			if( data.input_id === "right" ) { this.pressing.right = data.state }
			if( data.input_id === "down"  ) { this.pressing.down  = data.state }
		});
		
		socket.emit("connection", {
			world : { map: world.make(world.size, world.size, 3), size: world.size },
			id    : id,
			size  : this.size,
			img   : this.img,
			msg   : `Your session id is now: ${id}`
		});
		Object.defineProperty(this, "sent_id", { value: true, writable: false });
	}
	
	on_disconnect(socket, id) {
		if( this.name ) { socket.broadcast.emit("add_to_chat", { from: { name: "/", id: "/" }, msg: `${this.name} has ended their session` }) }
		delete PLAYER_LIST[id];
	}
}


// ------------------------------------------------------------


/* sockets */

var io = require("socket.io")(server, {});

function on(event, data) { io.emit(event, data) }

io.sockets.on("connection", function(socket) {
	let id = socket.id;
	let p  = new player();
	
	p.on_connect(socket, id);
	
	socket.on("disconnect", () => {
		p.on_disconnect(socket, id);
	});
	
	socket.on("send_msg_to_server", (data) => {
		if(data.from.id === id && data.msg[0] !== "/") {  // if user has matching credentials
			//  if user has a name & it matches provided name, then broadcast message
			if(  p.name && data.from.name === p.name ) { socket.broadcast.emit("add_to_chat", { from: {name: p.name}, msg: data.msg }) }
			if(  p.name && data.from.name !== p.name ) {  //  if user has a name & it doesn't match provided name, then tell them they can't do that and refuse to send message
				          socket.emit("add_to_chat", { from: {name:      "/", id: "/" }, msg: "You can't change your name!",        my_name: p.name });
			}
			if( !p.name ) {  //  if name hasn't been set, then set the name and send message
				Object.defineProperty(p, "name", { value: data.from.name, writable: false });
				          socket.emit("add_to_chat", {  from: { name:    "/", id: "/" }, msg: `Your session name is now: ${p.name}`, my_name: p.name });
				socket.broadcast.emit("add_to_chat", {  from: { name: p.name          }, msg: data.msg });
			}
		}
		
		if(data.from.id !== p.id) // disconnect
		
		exec_debug(socket, p, data); // run command
	});
});

function exec_debug(socket, p, data) {
	if( DEBUG === true && data.msg[0] === "/" ) {
		socket.emit("add_to_chat", { from: { name: "/", id: "/" }, msg: "You have issued a command" });
		return eval(data.msg.substr(1));
	}
}
function emit_debug(socket, p, data) { socket.emit("debug", data.msg) }


// ------------------------------------------------------------


/* packages */

function update_pckgs() {
	let pack = {};
	
	for(let player in PLAYER_LIST) {
		PLAYER_LIST[player].update();
		
		pack[player] = {
			x    : PLAYER_LIST[player].x,
			y    : PLAYER_LIST[player].y,
			size : PLAYER_LIST[player].size
		};
	}
	
	return pack;
}

setInterval(() => {
	var pack = update_pckgs();
	
	io.emit("update", pack);
}, ( 1000/8 ) );