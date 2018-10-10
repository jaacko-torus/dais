// if browser doesn"t support WebSocket, just show some notification and exit
if(!window.WebSocket) {
	console.log("Sorry, but your browser doesn\'t support WebSockets.")
}

// open connection
let HOST = location.origin.replace(/^http/, "ws");
console.log(HOST);
let ws = new WebSocket(HOST);



function ws_send(event, data) { ws.send(JSON.stringify({event, data})); }

ws.onopen = () => {
	console.log("Do something when server opens");
	ws_send("client_message", "hey");
};

ws.onerror = (error) => {
	console.log("Sorry, but there\"s some problem with your connection or the server is down.");
	console.log(error);
};

ws.onclose = () => {
	console.log("The server has closed")
};

// most important part - incoming messages
ws.onmessage = (message) => {
	message = JSON.parse(message.data);
	event(message.event, message.data);
};

var events = {
	["server_message"](data) {
		console.log(data);
	}
}

function event(event, data) {
	for(let type in events) {
		if(event === type) { events[event](data); }
	}
};


// --------------------------------------------------------------------------------------------------------------------


var DEBUG = {
	chat   : true,
	camera : false,
	grid   : false,
};

const chat = {
	area  : document.getElementById("chatarea"),
	form  : document.getElementById("chatform"),
	input : document.getElementById("chatinput")
};

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width  = 336; // document.body.clientWidth;
canvas.height = 336; // document.body.clientHeight;

ctx.font = "30px Arial";


// --------------------------------------------------------------------------------------------------------------------


let I;

// world

var world = {
	preload: {
		sub_image_size: 16,
		img: {},

		meta: {
			map    : { src: "./img/map.png"    , margin_x : 1 , margin_y: 1 },
			player : { src: "./img/player.png" , margin_y : 1 }
		},

		load_atlas() {
			for(let name in this.meta) {
				let src = this.meta[name].src;
				let margin_x = this.meta[name].add_width;
				let margin_y = this.meta[name].add_height;

				this.meta[name] = new Image();
				this.meta[name].onload = () => {
					this.meta[name].loaded = true;
					this.meta[name].sub_image_size = world.preload.sub_image_size;

					if( margin_x ) { this.meta[name].width  += margin_x; }
					if( margin_y ) { this.meta[name].height += margin_y; }

					world.preload.load_img_in_atlas(); // this is annoying
				};

				this.meta[name].src = src;
			}
		},

		load_img_in_atlas() {
			for(let name in this.meta) {
				this.img[name] = [];
				let size = this.meta[name].sub_image_size;

				for(let y = 0; y < this.meta[name].height; y += size + 1) {
					for(let x = -(world.preload.sub_image_size + 1); x < this.meta[name].width; x += size + 1) {
						this.img[name].push({
							size : this.meta[name].sub_image_size,
							x,
							y
						});
					}
				}
			}
		}
	},
	map: {
		data: [],
		size: 21,

		command: {
			default(l, y, x) {
				if( l === parseInt(world.map.layer.indexing[ "bottom"     ] , 10) ) {     this.bottom(l, y, x); }
				if( l === parseInt(world.map.layer.indexing[ "mid_bottom" ] , 10) ) { this.mid_bottom(l, y, x); }
				if( l === parseInt(world.map.layer.indexing[ "mid_top"    ] , 10) ) {    this.mid_top(l, y, x); }
				if( l === parseInt(world.map.layer.indexing[ "top"        ] , 10) ) {        this.top(l, y, x); }
			},

			draw(l, y, x, src) {
				ctx.drawImage(
					world.preload.meta[src],

					world.preload.img[src][world.map.data[l][y][x]].x,
					world.preload.img[src][world.map.data[l][y][x]].y,
					world.preload.img[src][world.map.data[l][y][x]].size,
					world.preload.img[src][world.map.data[l][y][x]].size,

					I.size * x,
					I.size * y,
					I.size,
					I.size
				);
			},


			bottom(l, y, x)     { this.draw( l, y, x, "map"    ); }, // terrain
			mid_bottom(l, y, x) {}, // static
			mid_top(l, y, x)    { this.draw( l, y, x, "player" ); }, // non-static
			top(l, y, x) { // events
				if( world.map.data[l][y][x] === -1 ) { world.mouse.move.draw(y, x);  }
				if( world.map.data[l][y][x] === -2 ) { world.mouse.click.draw(y, x); }
			},
		},

		update() {},

		draw(vx, vy) { // do something with vecotrs later to only draw what is necessary
			for(let l = 0; l < this.data.length; l++) {
				for(let y = 0; y < this.size; y++) {
					for(let x = 0; x < this.size; x++) {
						if( world.preload.meta.map.loaded ) { this.command.default(l, y, x); }
					}
				}
			}
		}
	},
	camera: {
		_size_: 2,
		get size() { return this._size_; }, // must be positive
		set size(n) { if(Number.isInteger(n) >= 0) { this._size_ = n; return n; } },

		center: { x: undefined, y: undefined },
		get area() { return this.size * I.size; },
		vector: {x: 0, y: 0},

		transform(data) {
			ctx.translate(
				I.size *  this.vector.x,
				I.size * -this.vector.y
			);

			world.map.draw();

			ctx.resetTransform();
		},
		update() {
			let px = (I.size * I.x) + (I.size * (world.map.size - 1) / 2); // player x
			let py = (I.size * I.y) + (I.size * (world.map.size - 1) / 2); // player y

			// since one cannot self reference properties to edit them, `this.center` is to be defined here if not previously done so
			if( !this.center.x ) { this.center.x = (world.map.size - 1) * I.size / 2; }
			if( !this.center.y ) { this.center.y = (world.map.size - 1) * I.size / 2; }

			// setting the bounds of the camera
			if( px > this.center.x + this.area ) { this.center.x += I.size; this.vector.x += -1; }
			if( px < this.center.x - this.area ) { this.center.x -= I.size; this.vector.x +=  1; }
			if( py > this.center.y + this.area ) { this.center.y += I.size; this.vector.y += -1; }
			if( py < this.center.y - this.area ) { this.center.y -= I.size; this.vector.y +=  1; }
		},
		draw() { // a function for making dashed lines based on grid tiles
			// FIX: doesn't quite work for any camera, should be more flexible
			function dashed_line(x1, y1, x2, y2) {
				ctx.beginPath();
				ctx.setLineDash([2, 1]);
				ctx.moveTo(x1 * I.size - 0.5, y1 * I.size - 0.5);
				ctx.lineTo(x2 * I.size - 0.5, y2 * I.size - 0.5);
				ctx.lineWidth = 4;
				ctx.strokeStyle = "#686868";
				ctx.stroke();
			}

			let low  = -this.size + 10;
			let high =  this.size + 11;

			dashed_line( low  , low  , low  , high );
			dashed_line( low  , high , high , high );
			dashed_line( high , low  , high , high );
			dashed_line( low  , low  , high , low  );
		}
	},
	grid: {
		update() {},
		draw() {
			for(let i = 0; i <= world.map.size; i++) {
				ctx.beginPath();
				ctx.setLineDash([2, 2]);
				ctx.moveTo( i * I.size - 0.25, 0             - 0.25 );
				ctx.lineTo( i * I.size - 0.25, canvas.width  - 0.25 );
				ctx.lineWidth = 0.5;
				ctx.strokeStyle = "#cfcfcf";
				ctx.stroke();

				ctx.beginPath();
				ctx.setLineDash([2, 2])
				ctx.moveTo( 0             - 0.25, i * I.size - 0.25 );
				ctx.lineTo( canvas.height - 0.25, i * I.size - 0.25 );
				ctx.lineWidth = 0.5;
				ctx.strokeStyle = "#cfcfcf";
				ctx.stroke();
			}
		},
	},
	mouse: {
		position: { x: undefined, y: undefined },
		tile_selected: { x: undefined, y: undefined },

		observe(type) {
			let e = type;
			
			if( type === "move" ) { e = "mousemove"; }
			let boolean = this[type].boolean;

			if(  boolean ) {    canvas.addEventListener(e, this[type].update, false); }
			if( !boolean ) { canvas.removeEventListener(e, this[type].update, false); }
		},

		move: {
			boolean: true,
			update(evt) {
				let rect = canvas.getBoundingClientRect();
				world.mouse.position = {
					x:  Math.floor( ( evt.clientX - rect.left ) / I.size ) - (world.map.size - 1) / 2 - world.camera.vector.x,
					y: -Math.floor( ( evt.clientY - rect.top  ) / I.size ) + (world.map.size - 1) / 2 - world.camera.vector.y
				};
				// console.log(world.mouse.position);
				let index_l =  world.map.data.length  - 1;
				let index_y = -world.mouse.position.y + (world.map.size - 1) / 2;
				let index_x =  world.mouse.position.x + (world.map.size - 1) / 2;

				// if the mouse is outside of the map, there is no need to color it.
				// erase all elements that do not match the mouse position
				for(let y = 0; y < world.map.size; y++) {
					for(let x = 0; x < world.map.size; x++) {
						if(world.map.data[index_l][y][x] === -1) { world.map.data[index_l][y][x] = 0; }
					}
				}
				// fill the corresponding square based on where th cursor is
				if(
					world.map.data[index_l][index_y] != null &&
					world.map.data[index_l][index_y][index_x] == 0 &&
					world.mouse.position.x ===  index_x - (world.map.size - 1) / 2 &&
					world.mouse.position.y === -index_y + (world.map.size - 1) / 2
				) { world.map.data[index_l][index_y][index_x] = -1; }
			},
			draw(y, x) {
				ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
				ctx.fillRect(
					I.size * x,
					I.size * y,
					I.size ,
					I.size
				);
			}
		},
		click: {
			boolean: true,
			infolog(x, y) { console.info(`You have selected coordinates {${world.mouse.tile_selected.x}, ${world.mouse.tile_selected.y}}`); },

			update(evt) {
				let rect = canvas.getBoundingClientRect();
				world.mouse.tile_selected = {
					x:  Math.floor( ( evt.clientX - rect.left ) / I.size ) - (world.map.size - 1) / 2 - world.camera.vector.x,
					y: -Math.floor( ( evt.clientY - rect.top  ) / I.size ) + (world.map.size - 1) / 2 - world.camera.vector.y
				};

				let index_l =  world.map.data.length  - 1;
				let index_y = -world.mouse.tile_selected.y + (world.map.size - 1) / 2;
				let index_x =  world.mouse.tile_selected.x + (world.map.size - 1) / 2;

				for(let y = 0; y < world.map.size; y++) {
					for(let x = 0; x < world.map.size; x++) {
						if(world.map.data[index_l][y][x] === -2) { world.map.data[index_l][y][x] = 0; }
					}
				}

				if(
					world.map.data[index_l][index_y] != null &&
					(world.map.data[index_l][index_y][index_x] == 0 || world.map.data[index_l][index_y][index_x] === -1) &&
					world.mouse.tile_selected.x ===  index_x - (world.map.size - 1) / 2 &&
					world.mouse.tile_selected.y === -index_y + (world.map.size - 1) / 2
				) { world.map.data[index_l][index_y][index_x] = -2; world.mouse.click.infolog(index_x, index_y); }
			},
			draw(y, x) {
				ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
				ctx.fillRect(
					I.size * x ,
					I.size * y ,
					I.size ,
					I.size
				);
			}
		},
	},
	keyboard: {
		boolean: true,

		key: {
			left  : false,
			up    : false,
			right : false,
			down  : false
		},

		move_emit(direction) { socket.emit("move", direction); },

		emit_keys(position) {
			// if( position === "down" ) { position = true  }
			// if( position === "up"   ) { position = false }

			return (e) => {
				if( position && ( e.key === "A" || e.key === "a" || e.key === "ArrowLeft"  ) ) { this.move_emit( "left"  ); }
				if( position && ( e.key === "W" || e.key === "w" || e.key === "ArrowUp"    ) ) { this.move_emit( "up"    ); }
				if( position && ( e.key === "D" || e.key === "d" || e.key === "ArrowRight" ) ) { this.move_emit( "right" ); }
				if( position && ( e.key === "S" || e.key === "s" || e.key === "ArrowDown"  ) ) { this.move_emit( "down"  ); }
			}
		},

		update(boolean) {
			// if(  boolean ) {    document.addEventListener("keydown", this.emit_keys("down"), false);    document.addEventListener("keyup", this.emit_keys("up"), false); }
			// if( !boolean ) { document.removeEventListener("keydown", this.emit_keys("down"), false); document.removeEventListener("keyup", this.emit_keys("up"), false); }
			if(  boolean ) {    document.addEventListener("keypress", this.emit_keys("down"), false); }
			if( !boolean ) { document.removeEventListener("keypress", this.emit_keys("down"), false); }
		}
	},

	update() {
		this.keyboard.update(this.keyboard.boolean); // this should be called `listener` instead, and be called only once.

		// same with these two
		this.mouse.observe("move");
		this.mouse.observe("click");
	},

	draw(data) {
		this.camera.update();

		this.camera.transform(data);

		if( DEBUG.camera ) { this.camera.draw(data); }
		if( DEBUG.grid ) { this.grid.draw(); }
	},
};


// --------------------------------------------------------------------------------------------------------------------


/* classes */

class Entity {
	constructor(x, y, size) {
		this.x    =    x;
		this.y    =    y;
		this.size = size;
	}

	get position() { return `${this.x}, ${this.y}`; }

	update() {}
	draw() {}
}

var PLAYER_LIST = {};

class Player extends Entity {
	constructor(x, y, size) { super(x, y, size); }

	static update(data) { // Leave this function be static for now
		// super.update();

		//  loop through `data`. If the player is not in `PLAYER_LIST` and is in `data`, then create a new player
		for( let id in data        ) { if( !PLAYER_LIST[id] ) { PLAYER_LIST[id] = new Player(data[id].x, data[id].y); } }
		
		for( let id in PLAYER_LIST ) {
			//  loop through `PLAYER_LIST` . If the player is not in `data` , then delete it
			//  loop through `PLAYER_LIST` . If the player is     in `data` , then update & draw players
			if( !data[id] ) { delete PLAYER_LIST[id] ;           }
			if(  data[id] ) {        PLAYER_LIST[id] = data[id]; }

			if( id === I.id ) { // update I
				I.x = PLAYER_LIST[id].x;
				I.y = PLAYER_LIST[id].y;
			}

			let index_l =  1;
			let index_y = -PLAYER_LIST[id].y + (world.map.size - 1) / 2;
			let index_x =  PLAYER_LIST[id].x + (world.map.size - 1) / 2;

			for(let y = 0; y < world.map.size; y++) {
				for(let x = 0; x < world.map.size; x++) {
					if(world.map.data[index_l][y][x] === 1) { world.map.data[index_l][y][x] = 0; }
				}
			}

			if (world.map.data[1][index_y]) {
				world.map.data[1][index_y][index_x] = 1;
			}
		}
	}

	static draw(data) {
		// FIX: make this function non-static so that the next line is doable
		// super.draw();
	}
}

class Self extends Player {
	constructor(id, x, y, size, img, my_name) {
		super(x, y, size);

		this.id      =      id;
		this.img     =     img;
		this.my_name = my_name;
	}

	// FIX: fake solution down ahead
	move( direction ) { world.keyboard.move_emit(direction, true); world.keyboard.move_emit(direction, false); }

	update() { super.update(); }
	draw() { super.draw(); }
}

I = new Self(
	"not connected - no id given",
	0,
	0,
	16,
	1,
	"" // my_name
);


// --------------------------------------------------------------------------------------------------------------------


// global update & draw functions

function update(data) {
	world.update();

	Player.update(data);
}

function draw(data) {
	world.draw(data);
}


// --------------------------------------------------------------------------------------------------------------------


// com with server

var socket = io();

socket.on("connection", (data) => {
	// CHANGE: make this shorter with `map` or something.
	if(data.world.debug) { for(let prop in DEBUG) { DEBUG[prop] = true; } }

	I.x    = data.me.x;
	I.y    = data.me.y;
	I.id   = data.me.id;
	I.img  = data.me.img;
	I.size = data.me.size;

	Object.assign(world.map, { data: data.world.map, size: data.world.size });
	world.map.layer = data.world.layer;

	world.preload.load_atlas();

	console.info(data.world.msg);
});

socket.on("new_map", (data) => { Object.assign(world, { map: data.world.map , size: data.world.size , layers}); });


// --------------------------------------------------------------------------------------------------------------------


// dealing with chat

socket.on("add_to_chat", (data) => {
	chat.area.innerHTML += `<div id="${data}">${data.from.name}: ${data.msg}` + "</div>";
	if( data.my_name ) {
		// I.name = data.my_name;
		console.info(data.msg);
	}
});


chat.form.onsubmit = (e) => {
	e.preventDefault();

	while( !I.name ) {
		I.name = prompt("Enter your name:\n*please note that names cannot be changed", "");
		socket.emit("player_name_entered", I.name);
	}
	socket.emit("send_msg_to_server", {from: {name: I.name, id: I.id}, msg: chat.input.value});

	chat.area.innerHTML += "<div>" + `${I.name}: ${chat.input.value}` + "</div>";
	chat.input.value = "";
};


if( DEBUG.chat ) { socket.on("debug", (data) => { console.log(data) }) }


// --------------------------------------------------------------------------------------------------------------------


// main loop

socket.on("update", (data) => {
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	update(data);
	draw(data);
});
