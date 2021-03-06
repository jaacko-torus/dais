/* debug */

const DEBUG = require("./server/constants/debug.js");

/* dependencies */

const express = require("express");
const app     = express();
const server  = require("http").createServer(app);
const io      = require("socket.io").listen(server);



let world        = require("./server/methods/world.js");
let player       = require("./server/classes/player.js");
let update_pckgs = require("./server/functions/update_pckgs.js");

/* routing */

app.get("/", function(req, res) {
	res.sendFile( __dirname + "/client/index.html" );
});

app.use(express.static("client"));

server.listen(process.env.PORT || 8080);
console.log("Server started.");


// --------------------------------------------------------------------------------------------------------------------


/* world methods */

// var world = {
// 	entities : new Map(),
// 	players  : new Map(),

// 	size: 21,

// 	layer: {
// 		size: 3
// 	},

// 	build(width, height, layer) {
// 		for(let l = 0; l < layer; l++) {
// 			this.map.push([])
// 			for(let y = 0; y < height; y++) {
// 				this.map[l].push([]);
// 				for(let x = 0; x < width; x++) {
// 					this.map[l][y].push( undefined );
// 				}
// 			}
// 		}
// 	},

// 	edit(width, height, layer) {
// 		// all tiles in layer 0 are grass
// 		for(let y = 0; y < height; y++) {
// 			for(let x = 0; x < width; x++) {
// 				this.map[0][y][x] = 6;
// 			}
// 		}
// 	},

// 	make(width, height, layer, socket) {
// 		this.map = [];

// 		this.build(width, height, layer);
// 		this.edit(width, height, layer);

// 		if( socket ) { socket.emit("new_map", this.map) }
// 		return this.map;
// 	},

// 	find(l, x, y) {
// 		return this.map[l][y + ((this.size - 1) / 2)][x + ((this.size - 1) / 2)];
// 	}
// };

world.make(world.size, world.size, world.layer.size);



// --------------------------------------------------------------------------------------------------------------------



/* classes */

// class entity {
// 	constructor(img, x = 0, y = 0) {
// 		this.x = x;
// 		this.y = y;

// 		this.img = img;

// 		this.size = 16;
// 	}

// 	update() {}
// }

// class player extends entity {
// 	constructor(x, y, spd_x = 0, spd_y = 0, img = 1) {
// 		super(img, x, y);

// 		this.spd_x = spd_x;
// 		this.spd_y = spd_y;

// 		this.spd = 1;

// 		this.pressing = {
// 			left  : false,
// 			up    : false,
// 			right : false,
// 			down  : false
// 		};
// 	}

// 	update() {
// 		this.update_spd();
// 		this.update_pos();
// 		super.update();
// 	}

// 	update_pos() {
// 		this.x += this.spd_x;
// 		this.y += this.spd_y;
// 	}

// 	update_spd() {
// 		if( this.pressing.left  ) { this.spd_x = -this.spd }
// 		if( this.pressing.up    ) { this.spd_y =  this.spd }
// 		if( this.pressing.right ) { this.spd_x =  this.spd }
// 		if( this.pressing.down  ) { this.spd_y = -this.spd }

// 		if( !( this.pressing.left || this.pressing.right ) ) { this.spd_x = 0; }
// 		if( !( this.pressing.up   || this.pressing.down  ) ) { this.spd_y = 0; }
// 	}

// 	on_connect(socket, id) {
// 		world.entities.set(id, this);
// 		world.players.set(id, this);

// 		socket.on("key_press", (data) => {
// 			if( data.input_id === "left"  ) { this.pressing.left  = data.state }
// 			if( data.input_id === "up"    ) { this.pressing.up    = data.state }
// 			if( data.input_id === "right" ) { this.pressing.right = data.state }
// 			if( data.input_id === "down"  ) { this.pressing.down  = data.state }
// 		});

// 		socket.emit("connection", {
// 			world : {
// 				DEBUG : DEBUG      ,
// 				map   : world.map  ,
// 				size  : world.size ,
// 				msg   : `You are now connected!\nYour session id is now: ${id}`
// 			},
// 			me    : {
// 				id    : id         ,
// 				x     : this.x     ,
// 				y     : this.y     ,
// 				size  : this.size  ,
// 				img   : this.img
// 			},
// 		});
// 		Object.defineProperty(this, "sent_id", { value: true, writable: false });
// 	}

// 	on_disconnect(socket, id) {
// 		if( this.name ) { socket.broadcast.emit("add_to_chat", { from: { name: "/", id: "/" }, msg: `${this.name} has ended their session` }) }
// 		world.entities.delete(id);
// 		world.players.delete(id);
// 	}
// }


// --------------------------------------------------------------------------------------------------------------------


/* sockets */

io.sockets.on("connection", function(socket) {
	function exec_debug(socket, p, data) {
		if( DEBUG === true && data.msg[0] === ";" ) {
			socket.emit("add_to_chat", { from: { name: ";", id: ";" }, msg: "You have issued a command" });
			return eval(data.msg.substr(1));
		}
	}

	function emit_debug(socket, p, data) { socket.emit("debug", data.msg) }


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
				socket.emit("add_to_chat", { from: { name: ";", id: ";" }, msg: `Your session name is now: ${p.name}`, my_name: p.name });
				socket.broadcast.emit("add_to_chat", { from: { name: p.name }, msg: data.msg });
			}
		}

		if(data.from.id !== p.id) // disconnect, nothing yet

		exec_debug(socket, p, data); // run command
	});
});



// --------------------------------------------------------------------------------------------------------------------


/* packages */

// function update_pckgs() {
// 	let pack = {};

// 	world.players.forEach((value, key, map) => {
// 		value.update();

// 		pack[key] = {
// 			x    : value.x,
// 			y    : value.y,
// 			size : value.size
// 		};
// 	});

// 	return pack;
// }

setInterval(() => {
	let pack = update_pckgs();

	io.emit("update", pack);
}, ( 1000/10 ) ); // prev 1000 / 8
