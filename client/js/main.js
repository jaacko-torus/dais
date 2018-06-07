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


/* classes */

class entity {
	constructor(x, y, size) {
		this.x    =    x;
		this.y    =    y;
		this.size = size;
	}

	get position() { return `${this.x}, ${this.y}` }

	update() {}
	draw() {}
}

var PLAYER_LIST = {};

class player extends entity {
	constructor(x, y, size) { super(x, y, size) }

	static update(data) { // Leave this function be static for now
		// super.update();

		//  loop through `data`        . If the player is not in `PLAYER_LIST` and is     in `data` , then create a new player
		//  loop through `PLAYER_LIST` . If the player is     in `PLAYER_LIST` and is not in `data` , then delete it
		//  loop through `PLAYER_LIST` . If the player is     in `PLAYER_LIST` and is     in `data` , then update & draw players
		for( let id in data        ) { if( !PLAYER_LIST[id] &&  data[id] ) {        PLAYER_LIST[id] = new player(data[id].x, data[id].y); } }
		for( let id in PLAYER_LIST ) { if(  PLAYER_LIST[id] && !data[id] ) { delete PLAYER_LIST[id] ;                           continue; } }
		for( let id in PLAYER_LIST ) { if(  PLAYER_LIST[id] &&  data[id] ) {        PLAYER_LIST[id] = data[id];                           } }

		for( let id in PLAYER_LIST ) { // update `I`
			if( id === I.id ) {
				I.x = PLAYER_LIST[id].x;
				I.y = PLAYER_LIST[id].y;
			}
		}
	}

	static draw(data) {
		// FIX: make this function non-static so that the next line is doable
		// super.draw();
		let pre = world.preload;
		for( let player in PLAYER_LIST ) {
			// if player exists in `PLAYER_LIST` & `data` and his image is loaded, then render

			if( PLAYER_LIST[player] && data[player] && pre.meta.player.loaded && world.map.size) {
				let player_image;

				if( player === I.id ) { player_image = I.img }
				if( player !== I.id ) { player_image =     0 }

				ctx.drawImage(
					pre.meta.player,

					pre.img.player[player_image].x,
					pre.img.player[player_image].y,
					pre.img.player[player_image].size,
					pre.img.player[player_image].size,

					 ((I.size * PLAYER_LIST[player].x)) + (I.size * (world.map.size - 1) / 2),
					-((I.size * PLAYER_LIST[player].y)) + (I.size * (world.map.size - 1) / 2),
					I.size,
					I.size
				);
			}
		}
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
	move( direction ) { world.keyboard.emit(direction, true); world.keyboard.emit(direction, false); }

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


var q;

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
				this.meta[name].onload = function() {
					this.loaded = true;
					this.sub_image_size = world.preload.sub_image_size;

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
		layers: 3,

		update() {},

		normal(l, y, x) {
			let pre = world.preload;

			ctx.drawImage(
				pre.meta.map,

				pre.img.map[this.data[l][y][x]].x    ,
				pre.img.map[this.data[l][y][x]].y    ,
				pre.img.map[this.data[l][y][x]].size ,
				pre.img.map[this.data[l][y][x]].size ,

				I.size * x ,
				I.size * y ,
				I.size ,
				I.size
			);
		},

		draw(vx, vy) { // do something with vecotrs later to only draw what is necessary
			let pre = world.preload;

			for(let l = 0; l < this.data.length; l++) {
				for(let y = 0; y < this.size; y++) {
					for(let x = 0; x < this.size; x++) {
						if( pre.meta.map.loaded ) {
							if( this.data[l][y][x] > 0 ) { this.normal(l, y, x) }
							// if( this.data[l][y][x] = 0 ) { world.mouse.move.draw(l, y, x) }
							if( this.data[l][y][x] === -1 ) { world.mouse.move.draw(y, x) }
							if( this.data[l][y][x] === -2 ) { world.mouse.click.draw(y, x) }
						}
					}
				}
			}
		}
	},
	camera: {
		set size(n) { if(Number.isInteger(n) >= 0) { return n } },
		size: 2, // must be positive
		center: { x: undefined, y: undefined },
		get area() { return this.size * I.size },
		vector: {x: 0, y: 0},

		transform(data) {
			ctx.translate(
				I.size *  this.vector.x,
				I.size * -this.vector.y
			);

			world.map.draw();

			player.draw(data);

			ctx.resetTransform();
		},
		update() {
			let px = (I.size * I.x) + (I.size * (world.map.size - 1) / 2); // player x
			let py = (I.size * I.y) + (I.size * (world.map.size - 1) / 2); // player y

			// since one cannot self reference properties to edit them, `this.center` is to be defined here if not previously done so
			if( !this.center.x ) { this.center.x = (world.map.size - 1) * I.size / 2 }
			if( !this.center.y ) { this.center.y = (world.map.size - 1) * I.size / 2 }

			// setting the bounds of the camera
			if( px > this.center.x + this.area ) { this.center.x += I.size; this.vector.x += -1; }
			if( px < this.center.x - this.area ) { this.center.x -= I.size; this.vector.x +=  1; }
			if( py > this.center.y + this.area ) { this.center.y += I.size; this.vector.y += -1; }
			if( py < this.center.y - this.area ) { this.center.y -= I.size; this.vector.y +=  1; }
		},
		draw() { // a function for making dashed lines based on grid tiles
			var dashed_line = function(x1, y1, x2, y2) {
				ctx.beginPath();
				ctx.setLineDash([2, 1])
				ctx.moveTo(x1 * I.size - 0.25, y1 * I.size - 0.25);
				ctx.lineTo(x2 * I.size - 0.25, y2 * I.size - 0.25);
				ctx.lineWidth = 2;
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
				ctx.setLineDash([2, 2])
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

		observe(boolean) {
			if(  boolean ) {    canvas.addEventListener( "click", this.click.update, false ) ;    canvas.addEventListener( "mousemove", this.move.update, false ) ; }
			if( !boolean ) { canvas.removeEventListener( "click", this.click.update, false ) ; canvas.removeEventListener( "mousemove", this.move.update, false ) ; this.position = {}; }
		},

		move: {
			boolean: true,
			update(evt) {
				let rect = canvas.getBoundingClientRect();
				world.mouse.position = {
					x:  Math.floor( ( evt.clientX - rect.left ) / I.size ) - (world.map.size - 1) / 2 - world.camera.vector.x,
					y: -Math.floor( ( evt.clientY - rect.top  ) / I.size ) + (world.map.size - 1) / 2 - world.camera.vector.y
				};

				let index_l =  world.map.data.length  - 1;
				let index_y = -world.mouse.position.y + (world.map.size - 1) / 2;
				let index_x =  world.mouse.position.x + (world.map.size - 1) / 2;

				// if the mouse is outside of the map, there is no need to color it.
				// erase all elements that do not match the mouse position
				for(y = 0; y < world.map.size; y++) {
					for(x = 0; x < world.map.size; x++) {
						if(world.map.data[index_l][y][x] === -1) { world.map.data[index_l][y][x] = null }
					}
				}
				// fill the corresponding square based on where th cursor is
				if(
					world.map.data[index_l][index_y][index_x] == null &&
					world.mouse.position.x ===  index_x - (world.map.size - 1) / 2 &&
					world.mouse.position.y === -index_y + (world.map.size - 1) / 2
				) { world.map.data[index_l][index_y][index_x] = -1 }
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
		click: { // FIX on hold, first fix move{}
			boolean: true,
			update(evt) {
				let rect = canvas.getBoundingClientRect();
				world.mouse.tile_selected = {
					x: Math.floor( ( evt.clientX - rect.left ) / I.size ),
					y: Math.floor( ( evt.clientY - rect.top  ) / I.size )
				};
				// world.mouse.ref_to_map_center = {
				// 	x: -world.camera.center.x + (world.mouse.tile_selected.x * I.size) ,
				// 	y:  world.camera.center.y - (world.mouse.tile_selected.y * I.size)
				// };

				let index_l =  world.map.data.length  - 1;
				let index_y = -world.mouse.position.y + (world.map.size - 1) / 2;
				let index_x =  world.mouse.position.x + (world.map.size - 1) / 2;

				// if the mouse is outside of the map, there is no need to color it.
				// erase all elements that do not match the mouse position
				// for(y = 0; y < world.map.size; y++) {
				// 	for(x = 0; x < world.map.size; x++) {
				// 		if(world.map.data[index_l][y][x] === -2) { world.map.data[index_l][y][x] = null }
				// 	}
				// }
				// fill the corresponding square based on where the cursor is
				if(
					world.map.data[index_l][index_y][index_x] == null &&
					world.mouse.position.x ===  index_x - (world.map.size - 1) / 2 &&
					world.mouse.position.y === -index_y + (world.map.size - 1) / 2
				) { world.map.data[index_l][index_y][index_x] = -2; console.log("click"); }
			},
			draw(vector_x, vector_y) {
				// let x, y;
				// x = I.size * world.mouse.tile_selected.x - vector_x;
				// y = I.size * world.mouse.tile_selected.y - vector_y;

				// console.log( world.mouse.ref_to_map_center );

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

		emit(direction, position) { socket.emit("key_press", { input_id: direction , state: position }) },

		emit_keys(position) {
			if( position === "down" ) { position = true  }
			if( position === "up"   ) { position = false }

			return (e) => {
				if( e.key === "A" || e.key === "a" || e.key === "ArrowLeft"  ) { this.emit( "left"  , position ) }
				if( e.key === "W" || e.key === "w" || e.key === "ArrowUp"    ) { this.emit( "up"    , position ) }
				if( e.key === "D" || e.key === "d" || e.key === "ArrowRight" ) { this.emit( "right" , position ) }
				if( e.key === "S" || e.key === "s" || e.key === "ArrowDown"  ) { this.emit( "down"  , position ) }
			}
		},

		update(boolean) {
			if(  boolean ) {    document.addEventListener("keydown", this.emit_keys("down"), false);    document.addEventListener("keyup", this.emit_keys("up"), false); }
			if( !boolean ) { document.removeEventListener("keydown", this.emit_keys("down"), false); document.removeEventListener("keyup", this.emit_keys("up"), false); }
		}
	},

	update() {
		this.keyboard.update(this.keyboard.boolean);

		this.mouse.observe(this.mouse.move.boolean);
		this.mouse.observe(this.mouse.click.boolean);
	},

	draw(data) {
		this.camera.update();

		this.camera.transform(data);

		// this.mouse.move.draw();

		if( DEBUG.camera ) { this.camera.draw(data) }
		if( DEBUG.grid ) { this.grid.draw() }
	},
};


// --------------------------------------------------------------------------------------------------------------------


function update(data) {
	world.update();

	player.update(data);
}

function draw(data) {
	world.draw(data);
}


// --------------------------------------------------------------------------------------------------------------------


var socket = io();

socket.on("connection", function(data) {
	if(data.world.debug) { // CHANGE: make this shorter with `map` or something.
		for(let prop in DEBUG) {
			DEBUG[prop] = true;
		}
	}

	I.id   = data.me.id,
	I.x    = data.me.x,
	I.y    = data.me.y,
	I.size = data.me.size,
	I.img  = data.me.img,

	Object.assign(world.map, { data: data.world.map , size: data.world.size });

	world.preload.load_atlas();

	console.info(data.world.msg);
});

socket.on("new_map", function(data) { Object.assign(world, { map: data.world.map , size: data.world.size }) });


socket.on("add_to_chat", function(data) {
	chat.area.innerHTML += `<div id="${data}">${data.from.name}: ${data.msg}` + "</div>";
	if( data.my_name ) {
		// I.name = data.my_name;
		console.info(data.msg);
	}
});


chat.form.onsubmit = function(e) {
	e.preventDefault();

	while( !I.name ) {
		I.name = prompt("Enter your name:\n*please note that names cannot be changed", "");
		socket.emit("player_name_entered", I.name);
	}
	socket.emit("send_msg_to_server", {from: {name: I.name, id: I.id}, msg: chat.input.value});

	chat.area.innerHTML += "<div>" + `${I.name}: ${chat.input.value}` + "</div>";
	chat.input.value = "";
};


if( DEBUG.chat ) { socket.on("debug", function(data) { console.log(data) }) }


socket.on("update", function(data) {
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	update(data);
	draw(data);
});
