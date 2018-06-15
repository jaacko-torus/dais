/* debug */

const DEBUG = true;

/* dependencies */

var express = require("express");
var app     = express();
var server  = require("http").createServer(app);
var io      = require("socket.io").listen(server);

/* routing */

app.get("/", function(req, res) {
	res.sendFile( __dirname + "/client/index.html" );
});

app.use(express.static("client"));

server.listen(process.env.PORT || 8080);
console.log("Server started.");


// --------------------------------------------------------------------------------------------------------------------


/* world methods */

var world = {
	size: 21,
	layer: {
		size: 3,
		indexing: {
			"bottom": "0",
			"mid_bottom": undefined,
			"mid_top": "1",
			"top": "2",
		}
	},

	build(width, height, layer) {
		for(let l = 0; l < layer; l++) {
			this.map.push([])
			for(let y = 0; y < height; y++) {
				this.map[l].push([]);
				for(let x = 0; x < width; x++) {
					this.map[l][y].push( 0 );
				}
			}
		}
	},

	edit(width, height, layer) {
		// all tiles in layer 0 are grass
		for(let y = 0; y < height; y++) {
			for(let x = 0; x < width; x++) {
				this.map[0][y][x] = 6;
			}
		}
	},
	
	make(width, height, layer, socket) {
		this.map = [];
		
		this.build(width, height, layer);
		this.edit(width, height, layer);
		
		if( socket ) { socket.emit("new_map", this.map) }
		return this.map;
	},
	
	find(l, x, y) {
		return this.map[l][y + ((this.size - 1) / 2)][x + ((this.size - 1) / 2)];
	}
};

world.make(world.size, world.size, world.layer.size);


// --------------------------------------------------------------------------------------------------------------------



/* classes */

class entity {
	constructor(img, x = 0, y = 0) {
		this.x = x;
		this.y = y;

		this.img = img;

		this.size = 16;
	}

	update() {}
}

var PLAYER_LIST = {};

class player extends entity {
	constructor(x, y, img = 1) {
		super(img, x, y);

		this.spd = 1;

		this.commands = [];

		this.going = {
			left  : false,
			up    : false,
			right : false,
			down  : false
		}
	}
	
	update() {
		super.update();

		this.update_spd();
		this.update_pos();
	}

	update_cmd(direction) {
		this.going[direction] -= 1;
		this.commands.push(direction);
	}

	update_spd() {
		if(this.going.left  ) { this.update_cmd( "left"  ) }
		if(this.going.up    ) { this.update_cmd( "up"    ) }
		if(this.going.right ) { this.update_cmd( "right" ) }
		if(this.going.down  ) { this.update_cmd( "down"  ) }
	}

	update_pos() {
		var current = this.commands.shift();

		if( current === "left"  ) { this.x -= 1 }
		if( current === "up"    ) { this.y += 1 }
		if( current === "right" ) { this.x += 1 }
		if( current === "down"  ) { this.y -= 1 }
	}

	on_connect(socket, id) {
		PLAYER_LIST[id] = this;

		socket.on("key_press", (data) => {
			if( data.input_id === "left"  ) { this.going.left  += 1 }
			if( data.input_id === "up"    ) { this.going.up    += 1 }
			if( data.input_id === "right" ) { this.going.right += 1 }
			if( data.input_id === "down"  ) { this.going.down  += 1 }
		});
		
		socket.emit("connection", {
			world : {
				DEBUG : DEBUG       ,
				map   : world.map   ,
				size  : world.size  ,
				layer : world.layer ,
				msg   : `You are now connected!\nYour session id is now: ${id}`,
			},
			me    : {
				id    : id          ,
				x     : this.x      ,
				y     : this.y      ,
				size  : this.size   ,
				img   : this.img
			},
		});
		Object.defineProperty(this, "sent_id", { value: true, writable: false });
	}

	on_disconnect(socket, id) {
		if( this.name ) { socket.broadcast.emit("add_to_chat", { from: { name: "/", id: "/" }, msg: `${this.name} has ended their session` }) }
		delete PLAYER_LIST[id];
	}
}


// --------------------------------------------------------------------------------------------------------------------


/* sockets */

io.sockets.on("connection", function(socket) {
	let id = socket.id;
	let p  = new player();

	p.on_connect(socket, id);

	socket.on("disconnect", () => {
		p.on_disconnect(socket, id);
	});

	socket.on("send_msg_to_server", (data) => {
		if(data.from.id === id && data.msg[0] !== ";") {  // if user has matching credentials

			//  if user has a name & it matches provided name, then broadcast message
			if(  p.name && data.from.name === p.name ) { socket.broadcast.emit("add_to_chat", { from: {name: p.name}, msg: data.msg }) }

			//  if user has a name & it doesn't match provided name, then tell them they can't do that and refuse to send message
			if(  p.name && data.from.name !== p.name ) { socket.emit("add_to_chat", { from: {name: ";", id: ";" }, msg: "You can't change your name!", my_name: p.name }); }

			//  if name hasn't been set, then set the name and send message
			if( !p.name  ) {
				Object.defineProperty(p, "name", { value: data.from.name, writable: false });
				          socket.emit("add_to_chat", { from: { name: ";"   , id: ";" }, msg: `Your session name is now: ${p.name}`, my_name: p.name });
				socket.broadcast.emit("add_to_chat", { from: { name: p.name          }, msg: data.msg });
			}
		}

		if(data.from.id !== p.id) {} // disconnect, nothing yet

		exec_debug(socket, p, data); // run command
	});
});

function exec_debug(socket, p, data) {
	if( DEBUG === true && data.msg[0] === ";" ) {
		socket.emit("add_to_chat", { from: { name: ";", id: ";" }, msg: "You have issued a command" });
		return eval(data.msg.substr(1));
	}
}

function emit_debug(socket, p, data) { socket.emit("debug", data.msg) }


// --------------------------------------------------------------------------------------------------------------------


/* packages */

function update_pckgs() {
	let pack = {};

	for(let player in PLAYER_LIST) {
		PLAYER_LIST[player].update();

		pack[player] = {
			x    : PLAYER_LIST[player].x,
			y    : PLAYER_LIST[player].y,
			img  : PLAYER_LIST[player].img,
			size : PLAYER_LIST[player].size
		};
	}

	return pack;
}

setInterval(() => {
	var pack = update_pckgs();
	
	io.emit("update", pack);
}, ( 1000/10 ) ); // prev 1000 / 8
