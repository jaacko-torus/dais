var DEBUG = {
	chat   : false,
	camera : false,
	grid   : false,
};

const chat = {
	area  : document.getElementById("chatarea"),
	form  : document.getElementById("chatform"),
	input : document.getElementById("chatinput")
}

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width  = 336; // document.body.clientWidth;
canvas.height = 336; // document.body.clientHeight;

ctx.font = "30px Arial";



// --------------------------------------------------------------------------------------------------------------------


// world

var world = {};

world.entities = new Map();
world.players  = new Map();

world.preload = {
	sub_image_width    : 16,
	sub_image_height   : 16,
	sub_image_margin_x :  1,
	sub_image_margin_y :  1,

	img: {},

	meta: {
		map    : { src: "./img/map.png"    , margin_x: 0, margin_y: 0, sub_image_width: 16, sub_image_height: 16 },
		player : { src: "./img/player.png" , margin_x: 0, margin_y: 0, sub_image_width: 16, sub_image_height: 16 }
	},

	load_atlas() {
		for(let name in this.meta) {
			let src = this.meta[name].src;

			let margin_x = this.meta[name].margin_x;
			let margin_y = this.meta[name].margin_y;

			let sub_image_width    = this.meta[name].sub_image_width    || world.preload.sub_image_width;
			let sub_image_height   = this.meta[name].sub_image_height   || world.preload.sub_image_height;
			let sub_image_margin_x = this.meta[name].sub_image_margin_x || world.preload.sub_image_margin_x;
			let sub_image_margin_y = this.meta[name].sub_image_margin_y || world.preload.sub_image_margin_y;

			this.meta[name] = new Image();
			this.meta[name].loaded = false;

			this.meta[name].onload = function() { // leave this as is. If arrow function it wont have a `this`
				this.loaded = true;
				
				this.sub_image_width    = sub_image_width;
				this.sub_image_height   = sub_image_height;
				this.sub_image_margin_x = sub_image_margin_x;
				this.sub_image_margin_y = sub_image_margin_y;

				if( margin_x ) { this.width  += margin_x }
				if( margin_y ) { this.height += margin_y }

				world.preload.load_img_in_atlas(); // this is annoying
			}

			this.meta[name].src = src;
		}
	},

	load_img_in_atlas() {
		for(let name in this.meta) {
			this.img[name] = [];

			// let size = this.meta[name].sub_image_size;

			let width    = this.meta[name].sub_image_width;
			let height   = this.meta[name].sub_image_height;
			let margin_x = this.meta[name].sub_image_margin_x;
			let margin_y = this.meta[name].sub_image_margin_y;

			for(let y = 0 + margin_y; y < this.meta[name].height; y += height + margin_y) {
				for(let x = -(width + margin_x); x < this.meta[name].width; x += width + margin_y) {
					this.img[name].push({
						// size,
						width,
						height,
						x,
						y
					});
				}
			}
			// for(let y = 0; y < this.meta[name].height; y += size + 1) {
			// 	for(let x = -(size + 1); x < this.meta[name].width; x += size + 1) {
			// 		this.img[name].push({
			// 			size,
			// 			x,
			// 			y
			// 		});
			// 	}
			// }
		}
	}
};

world.map = {
	data      : [],
	size      : 21,
	tile_size : 16,
	layers    : 3,

	command: {
		default(l, y, x) {
			if(l === parseInt(world.map.layer.indexing[ "bottom"     ], 10)) {     this.bottom(l, y, x); }
			if(l === parseInt(world.map.layer.indexing[ "mid_bottom" ], 10)) { this.mid_bottom(l, y, x); }
			if(l === parseInt(world.map.layer.indexing[ "mid_top"    ], 10)) {    this.mid_top(l, y, x); }
			if(l === parseInt(world.map.layer.indexing[ "top"        ], 10)) {        this.top(l, y, x); }
		},

		draw(l, y, x, src) {
			ctx.drawImage(
				world.preload.meta[src],

				world.preload.img[src][world.map.data[l][y][x]].x,
				world.preload.img[src][world.map.data[l][y][x]].y,
				world.preload.img[src][world.map.data[l][y][x]].width,
				world.preload.img[src][world.map.data[l][y][x]].height,

				world.map.tile_size * x,
				world.map.tile_size * y,
				world.map.tile_size ,
				world.map.tile_size
			);
		},

		bottom(l, y, x)     { this.draw(l, y, x, "map"    ); }, // terrain
		mid_bottom(l, y, x) {}, // static
		mid_top(l, y, x)    { this.draw(l, y, x, "player" ); }, // non-static
		top(l, y, x) { // events
			if(world.map.data[l][y][x] === -1) { world.mouse.move.draw(y, x); }
			if(world.map.data[l][y][x] === -2) { world.mouse.click.draw(y, x); }
		}
	},

	update() {},

	// normal(l, y, x) {
	// 	let pre = world.preload;

	// 	ctx.drawImage(
	// 		pre.meta.map,

	// 		pre.img.map[this.data[l][y][x]].x    ,
	// 		pre.img.map[this.data[l][y][x]].y    ,
	// 		pre.img.map[this.data[l][y][x]].size ,
	// 		pre.img.map[this.data[l][y][x]].size ,

	// 		I.size * x ,
	// 		I.size * y ,
	// 		I.size ,
	// 		I.size
	// 	);
	// },

	draw(vx, vy) { // do something with vecotrs later to only draw what is necessary
		for(let l = 0; l < this.data.length; l++) {
			for(let y = 0; y < this.size; y++) {
				for(let x = 0; x < this.size; x++) {
					if(world.preload.meta.map.loaded) { this.command.default(l, y, x); }
				}
			}
		}
		// let pre = world.preload;

		// for(let l = 0; l < this.data.length; l++) {
		// 	for(let y = 0; y < this.size; y++) {
		// 		for(let x = 0; x < this.size; x++) {
		// 			if( pre.meta.map.loaded ) {
		// 				if( this.data[l][y][x] > 0 ) { this.normal(l, y, x) }
		// 				// if( this.data[l][y][x] = 0 ) { world.mouse.move.draw(l, y, x) }
		// 				if( this.data[l][y][x] === -1 ) { world.mouse.move.draw(y, x) }
		// 				if( this.data[l][y][x] === -2 ) { world.mouse.click.draw(y, x) }
		// 			}
		// 		}
		// 	}
		// }
	}
};

world.camera = {
	_size_: 2,
	get size() { return this._size_; },
	set size(n) { if(Number.isInteger(n) >= 0) { this._size_ = n; return n; } },
	// set size(n) { if(Number.isInteger(n) >= 0) { return n } },
	// size: 2, // must be positive
	center: { x: undefined, y: undefined },
	// get area() { return this.size * I.size },
	get area() { return this.size * world.map.tile_size; },
	vector: {x: 0, y: 0},

	transform(data) {
		ctx.translate(
			I.size *  this.vector.x,
			I.size * -this.vector.y
		);

		world.map.draw();

		// player.draw(data);

		ctx.resetTransform();
	},
	update() {
		let px = (world.map.tile_size * I.x) + (I.size * (world.map.size - 1) / 2); // player x
		let py = (world.map.tile_size * I.y) + (I.size * (world.map.size - 1) / 2); // player y

		// since one cannot self reference properties to edit them, `this.center` is to be defined here if not previously done so
		if( !this.center.x ) { this.center.x = (world.map.size - 1) * I.size / 2 }
		if( !this.center.y ) { this.center.y = (world.map.size - 1) * I.size / 2 }

		// setting the bounds of the camera
		if( px > this.center.x + this.area ) { this.center.x += world.map.tile_size; this.vector.x += -1; }
		if( px < this.center.x - this.area ) { this.center.x -= world.map.tile_size; this.vector.x +=  1; }
		if( py > this.center.y + this.area ) { this.center.y += world.map.tile_size; this.vector.y += -1; }
		if( py < this.center.y - this.area ) { this.center.y -= world.map.tile_size; this.vector.y +=  1; }
		// let px = (I.size * I.x) + (I.size * (world.map.size - 1) / 2); // player x
		// let py = (I.size * I.y) + (I.size * (world.map.size - 1) / 2); // player y

		// // since one cannot self reference properties to edit them, `this.center` is to be defined here if not previously done so
		// if( !this.center.x ) { this.center.x = (world.map.size - 1) * I.size / 2 }
		// if( !this.center.y ) { this.center.y = (world.map.size - 1) * I.size / 2 }

		// // setting the bounds of the camera
		// if( px > this.center.x + this.area ) { this.center.x += I.size; this.vector.x += -1; }
		// if( px < this.center.x - this.area ) { this.center.x -= I.size; this.vector.x +=  1; }
		// if( py > this.center.y + this.area ) { this.center.y += I.size; this.vector.y += -1; }
		// if( py < this.center.y - this.area ) { this.center.y -= I.size; this.vector.y +=  1; }
	},
	draw() { // a function for making dashed lines based on grid tiles
		// FIX: doesn't quite work for any camera, should be more flexible
		var dashed_line = (x1, y1, x2, y2) => {
			ctx.beginPath();
			ctx.setLineDash([2, 1])
			ctx.moveTo(x1 * world.map.tile_size - 0.5, y1 * world.map.tile_size - 0.5);
			ctx.lineTo(x2 * world.map.tile_size - 0.5, y2 * world.map.tile_size - 0.5);
			ctx.lineWidth = 4;
			ctx.strokeStyle = "#686868";
			ctx.stroke();
		}

		let low  = -world.map.tile_size + 10;
		let high =  world.map.tile_size + 11;

		dashed_line( low  , low  , low  , high );
		dashed_line( low  , high , high , high );
		dashed_line( high , low  , high , high );
		dashed_line( low  , low  , high , low  );
	}
};

world.grid = {
	update() {},
	draw() {
		for(let i = 0; i <= world.map.size; i++) {
			ctx.beginPath();
			ctx.setLineDash([2, 2])
			ctx.moveTo( i * world.map.tile_size - 0.25, 0             - 0.25 );
			ctx.lineTo( i * world.map.tile_size - 0.25, canvas.width  - 0.25 );
			ctx.lineWidth = 0.5;
			ctx.strokeStyle = "#cfcfcf";
			ctx.stroke();

			ctx.beginPath();
			ctx.setLineDash([2, 2])
			ctx.moveTo( 0             - 0.25, i * world.map.tile_size - 0.25 );
			ctx.lineTo( canvas.height - 0.25, i * world.map.tile_size - 0.25 );
			ctx.lineWidth = 0.5;
			ctx.strokeStyle = "#cfcfcf";
			ctx.stroke();
		}
	},
};

world.mouse = {
	position: { x: undefined, y: undefined },
	tile_selected: { x: undefined, y: undefined },

	// observe(boolean) {
	// 	if(  boolean ) {    canvas.addEventListener( "click", this.click.update, false ) ;    canvas.addEventListener( "mousemove", this.move.update, false ) ; }
	// 	if( !boolean ) { canvas.removeEventListener( "click", this.click.update, false ) ; canvas.removeEventListener( "mousemove", this.move.update, false ) ; this.position = {}; }
	// },

	observe(type) {
		let e = type;

		if(type === "move") { e = "mousemove"; }
		let boolean = this[type].boolean;

		if(  boolean ) {    canvas.addEventListener(e, this[type].update, false); }
		if( !boolean ) { canvas.removeEventListener(e, this[type].update, false); }
	},

	move: {
		boolean: true,
		update(evt) {
			let rect = canvas.getBoundingClientRect();
			world.mouse.position = {
				x:  Math.floor( ( evt.clientX - rect.left ) / world.map.tile_size ) - (world.map.size - 1) / 2 - world.camera.vector.x,
				y: -Math.floor( ( evt.clientY - rect.top  ) / world.map.tile_size ) + (world.map.size - 1) / 2 - world.camera.vector.y
			};
			// console.log(world.mouse.position);
			let index_l =  world.map.data.length  - 1;
			let index_y = -world.mouse.position.y + (world.map.size - 1) / 2;
			let index_x =  world.mouse.position.x + (world.map.size - 1) / 2;

			// if the mouse is outside of the map, there is no need to color it.
			// erase all elements that do not match the mouse position
			for(y = 0; y < world.map.size; y++) {
				for(x = 0; x < world.map.size; x++) {
					if(world.map.data[index_l][y][x] === -1) { world.map.data[index_l][y][x] = 0; }
				}
			}
			// fill the corresponding square based on where th cursor is
			if(
				// if row is not `undefined` or `null`
				world.map.data[index_l][index_y] != null &&
				// if cell is `0`
				world.map.data[index_l][index_y][index_x] == 0 &&
				// if cell's `x` & `y` are within the world map
				world.mouse.position.x ===  index_x - (world.map.size - 1) / 2 &&
				world.mouse.position.y === -index_y + (world.map.size - 1) / 2
			// set cell to `-1`
			) { world.map.data[index_l][index_y][index_x] = -1 }
		},
		draw(y, x) {
			ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
			ctx.fillRect(
				world.map.tile_size * x,
				world.map.tile_size * y,
				world.map.tile_size ,
				world.map.tile_size
			);
		}
	},
	click: {
		boolean: true,
		infolog(x, y) { console.info(`You have selected coordinates {${world.mouse.tile_selected.x}, ${world.mouse.tile_selected.y}}`) },

		update(evt) {
			let rect = canvas.getBoundingClientRect();
			world.mouse.tile_selected = {
				x:  Math.floor( ( evt.clientX - rect.left ) / world.map.tile_size ) - ( (world.map.size - 1) / 2 ) - world.camera.vector.x,
				y: -Math.floor( ( evt.clientY - rect.top  ) / world.map.tile_size ) + ( (world.map.size - 1) / 2 ) - world.camera.vector.y
			};

			let index_l =  world.map.data.length  - 1;
			let index_y = -world.mouse.tile_selected.y + (world.map.size - 1) / 2;
			let index_x =  world.mouse.tile_selected.x + (world.map.size - 1) / 2;

			for(y = 0; y < world.map.size; y++) {
				for(x = 0; x < world.map.size; x++) {
					if(world.map.data[index_l][y][x] === -2) { world.map.data[index_l][y][x] = 0; }
				}
			}

			if (
				// if row is not `undefined` or `null`
				world.map.data[index_l][index_y] != null &&
				(
					// if cell is either `0` or `-1`
					world.map.data[index_l][index_y][index_x] ==   0 ||
					world.map.data[index_l][index_y][index_x] === -1
				) &&
				// if cell's `x` & `y` are within the world map
				world.mouse.tile_selected.x ===  index_x - (world.map.size - 1) / 2 &&
				world.mouse.tile_selected.y === -index_y + (world.map.size - 1) / 2
			) {
				// set cell to `-2` and log it
				world.map.data[index_l][index_y][index_x] = -2;
				world.mouse.click.infolog(index_x, index_y);
			}
		},
		draw(y, x) {
			ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
			ctx.fillRect(
				world.map.tile_size * x ,
				world.map.tile_size * y ,
				world.map.tile_size ,
				world.map.tile_size
			);
		}
	},
};

world.keyboard = {
	boolean: true,

	key: {
		left  : false,
		up    : false,
		right : false,
		down  : false
	},

	server_emit(direction, position) { socket.emit("key_press", { input_id: direction , state: position }) },

	emit_keys(position) {
		if( position === "down" ) { position = true  }
		if( position === "up"   ) { position = false }

		return (e) => {
			if( e.key === "A" || e.key === "a" || e.key === "ArrowLeft"  ) { this.server_emit( "left"  , position ) }
			if( e.key === "W" || e.key === "w" || e.key === "ArrowUp"    ) { this.server_emit( "up"    , position ) }
			if( e.key === "D" || e.key === "d" || e.key === "ArrowRight" ) { this.server_emit( "right" , position ) }
			if( e.key === "S" || e.key === "s" || e.key === "ArrowDown"  ) { this.server_emit( "down"  , position ) }
		}
	},

	update(boolean) {
		if(  boolean ) {    document.addEventListener("keydown", this.emit_keys("down"), false);    document.addEventListener("keyup", this.emit_keys("up"), false); }
		if( !boolean ) { document.removeEventListener("keydown", this.emit_keys("down"), false); document.removeEventListener("keyup", this.emit_keys("up"), false); }
	}
};

world.update = () => {
	world.keyboard.update(world.keyboard.boolean);

	world.mouse.observe("move");
	world.mouse.observe("click");
	// this.mouse.observe(this.mouse.move.boolean);
	// this.mouse.observe(this.mouse.click.boolean);
};

world.draw = (data) => {
	world.camera.update();

	world.camera.transform(data);

	if( DEBUG.camera ) { world.camera.draw(data); }
	if( DEBUG.grid   ) { world.grid.draw();       }
};


// --------------------------------------------------------------------------------------------------------------------


/* classes */

class entity {
	constructor(x, y, size) {
		this.x    =    x;
		this.y    =    y;
		this.size = size;
	}

	get position() { return `${this.x}, ${this.y}`; }

	update() {}
	draw() {}
}

// var PLAYER_LIST = {};

class player extends entity {
	constructor(x, y, size) { super(x, y, size) }

	static update(data) { // Leave this function be static for now
		// super.update();

		//  loop through `data`        . If the player is not in `PLAYER_LIST` and is     in `data` , then create a new player
		//  loop through `PLAYER_LIST` . If the player is     in `PLAYER_LIST` and is not in `data` , then delete it
		//  loop through `PLAYER_LIST` . If the player is     in `PLAYER_LIST` and is     in `data` , then update & draw players
		for( let id in data                 ) { if( !world.players.get(id) &&  data[id] ) { world.players.set(id, new player(data[id].x, data[id].y)); } }
		for( let id of world.players.keys() ) { if(  world.players.get(id) && !data[id] ) { world.players.delete(id);                        continue; } }
		for( let id of world.players.keys() ) { if(  world.players.get(id) &&  data[id] ) { world.players.set(id, data[id]);                           } }

		for( let id of world.players.keys() ) { // update `I`
			if( id === I.id ) {
				I.x = world.players.get(id).x;
				I.y = world.players.get(id).y;
			}
		}
	}

	static draw(data) {
		// FIX: make this function non-static so that the next line is doable
		// super.draw();

		// for( let player of world.players.keys() ) {

		// 	// if player exists in `PLAYER_LIST` & `data` and his image is loaded, then render
		// 	if( world.players.get(player) && data[player] && world.preload.meta.player.loaded && world.map.size) {
		// 		let player_image;

		// 		if( player === I.id ) { player_image = I.img }
		// 		if( player !== I.id ) { player_image =     1 }

		// 		ctx.drawImage(
		// 			world.preload.meta.player,

		// 			world.preload.img.player[player_image].x,
		// 			world.preload.img.player[player_image].y,
		// 			world.preload.img.player[player_image].size,
		// 			world.preload.img.player[player_image].size,

		// 			 ((I.size * world.players.get(player).x)) + (I.size * (world.map.size - 1) / 2),
		// 			-((I.size * world.players.get(player).y)) + (I.size * (world.map.size - 1) / 2),
		// 			I.size,
		// 			I.size
		// 		);
		// 	}
		// }
	}
}

class self extends player {
	constructor(id, x, y, size, img, my_name) {
		super(x, y, size);

		this.id      =      id;
		this.img     =     img;
		this.my_name = my_name;
	}

	// FIX: fake solution down ahead
	move(direction) {
		world.keyboard.server_emit(direction, true  );
		world.keyboard.server_emit(direction, false );
	}

	update() { super.update() }
	draw() { super.draw() }
}

var I = new self(
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

	player.update(data);
}

function draw(data) {
	world.draw(data);
}


// --------------------------------------------------------------------------------------------------------------------


// com with server

var socket = io();

socket.on("connection", (data) => {
	if(data.world.debug) { // CHANGE: make this shorter with `map` or something.
		for(let prop in DEBUG) {
			DEBUG[prop] = true;
		}
	}

	I.x    = data.me.x,
	I.y    = data.me.y,
	I.id   = data.me.id,
	I.img  = data.me.img,
	I.size = data.me.size,

	world.map = {
		...world.map,
		data  : data.world.map,
		size  : data.world.size,
		layer : data.world.layer
	};

	world.preload.load_atlas();

	console.info(data.world.msg);
});

socket.on("new_map", (data) => { world = {...world, map: data.world.map , size: data.world.size , layers}; });


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


if( DEBUG.chat ) { socket.on("debug", (data) => { console.log(data); }) }


// --------------------------------------------------------------------------------------------------------------------


// main loop

socket.on("update", (data) => {
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	update(data);
	draw(data);
});