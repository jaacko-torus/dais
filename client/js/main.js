var DEBUG;

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


var atlas = {
	map    : { src: "./img/map.png"    , add_width  : 1 , add_height: 1 },
	player : { src: "./img/player.png" , add_height : 1 }
};

var img = {};

function load_all_atlas() {
	for(let name in atlas) {
		let src = atlas[name].src;
		let add_width  = atlas[name].add_width;
		let add_height = atlas[name].add_height;

		atlas[name] = new Image();
		atlas[name].onload = function() {
			this.loaded = true;
			this.sub_image_size = 16;

			if( add_width  ) { this.width  += add_width  }
			if( add_height ) { this.height += add_height }

			load_all_images();
		}

		atlas[name].src = src;
	}
}

function load_all_images() {
	for(let name in atlas) {
		img[name] = [];
		let size = atlas[name].sub_image_size;

		for(let y = 0; y < atlas[name].height; y += size + 1) {
			for(let x = 0; x < atlas[name].width; x += size + 1) {
				img[name].push({
					size : atlas[name].sub_image_size,
					x,
					y
				});
			}
		}
	}
}


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

	static update(data) {
		// BUG: make this function non-static so that the next line is doable
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
		// super.draw();
		for( let player in PLAYER_LIST ) {
			// if player exists in `PLAYER_LIST` & `data` and his image is loaded, then render

			if( PLAYER_LIST[player] && data[player] && atlas.player.loaded && world.map.size) {
				let player_image;

				if( player === I.id ) { player_image = I.img }
				if( player !== I.id ) { player_image =     0 }

				ctx.drawImage(
					atlas.player,

					img.player[player_image].x,
					img.player[player_image].y,
					img.player[player_image].size,
					img.player[player_image].size,

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

	update() { super.update() }
	draw() { super.draw() }
}

var I = new self(
	"not connected - no id given",
	0,
	0,
	16,
	0,
	"" // my_name
);

// --------------------------------------------------------------------------------------------------------------------


var world = {
	map: {
		data: [],
		size: 21,
		update() {},
		draw(vx, vy) {
			for(let l = 0; l < this.data.length; l++) {
				for(let x = 0; x < this.size; x++) {
					for(let y = 0; y < this.size; y++) {
						if(atlas.map.loaded && this.data[l] && this.data[l][x] && this.data[l][x][y]) {
							ctx.drawImage(
								atlas.map,

								img.map[this.data[l][x][y]].x    ,
								img.map[this.data[l][x][y]].y    ,
								img.map[this.data[l][x][y]].size ,
								img.map[this.data[l][x][y]].size ,

								I.size * x ,
								I.size * y ,
								I.size ,
								I.size
							);
						}
					}
				}
			}
		}
	},
	camera: {
		size: 5,
		center: {},
		get area()   { return (this.size - 1) * I.size / 2 },
		vector: {x: 0, y: 0},

		transform(data) {
			ctx.translate(this.vector.x, this.vector.y);

			world.map.draw(this.vector.x, this.vector.y);
			if( DEBUG ) { this.draw() }
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
			if( px > this.center.x + this.area ) { this.center.x += I.size; this.vector.x += -I.size; }
			if( px < this.center.x - this.area ) { this.center.x -= I.size; this.vector.x +=  I.size; }
			if( py > this.center.y + this.area ) { this.center.y += I.size; this.vector.y +=  I.size; }
			if( py < this.center.y - this.area ) { this.center.y -= I.size; this.vector.y += -I.size; }
		},
		draw() {
			// FIX: the next function should be more universal, instead of being set to the `camera.size` of 5, it should be able to use the variable
			// a function for making dashed lines based on grid tiles
			var dashed_line = function(x1, y1, x2, y2) {
				ctx.beginPath();
				ctx.setLineDash([2, 1])
				ctx.moveTo(x1 * I.size - 0.25, y1 * I.size - 0.25);
				ctx.lineTo(x2 * I.size - 0.25, y2 * I.size - 0.25);
				ctx.lineWidth = 2;
				ctx.strokeStyle = "#797979";
				ctx.stroke();
			}
			dashed_line(  8,  8,  8, 13 );
			dashed_line(  8, 13, 13, 13 );
			dashed_line( 13,  8, 13, 13 );
			dashed_line(  8,  8, 13,  8 );
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
		position: {},

		observe(boolean) {
			if(  boolean ) {    canvas.addEventListener( "mousemove", this.update, false ) }
			if( !boolean ) { canvas.removeEventListener( "mousemove", this.update, false ) }
		},
		update(evt) {
			let rect = canvas.getBoundingClientRect();
			world.mouse.position = {
				x: Math.floor( ( evt.clientX - rect.left ) / I.size ),
				y: Math.floor( ( evt.clientY - rect.top  ) / I.size )
			};
		},
		draw() {
			ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
			ctx.fillRect( I.size * this.position.x, I.size * this.position.y, I.size, I.size );
		}
	},

	update() {
	},

	draw(data) {
		this.camera.update();

		this.camera.transform(data);

		this.mouse.draw();

		if( DEBUG ) {
			this.grid.draw();
			this.camera.draw(data);
		}
	},
};


// --------------------------------------------------------------------------------------------------------------------


function update(data) {
	player.update(data);
}

function draw(data) {
	world.draw(data);
}


// --------------------------------------------------------------------------------------------------------------------


var socket = io();

socket.on("connection", function(data) {
	DEBUG = data.world.DEBUG

	I.id   = data.me.id,
	I.x    = data.me.x,
	I.y    = data.me.y,
	I.size = data.me.size,
	I.img  = data.me.img,

	Object.assign(world.map, { data: data.world.map , size: data.world.size });

	load_all_atlas();
	console.info(data.world.msg);
});

socket.on("new_map", function(data) { Object.assign(world, { map: data.world.map , size: data.world.size }) });


socket.on("add_to_chat", function(data) {
	chat.area.innerHTML += `<div id="${data}">${data.from.name}: ${data.msg}` + "</div>";
	if( data.my_name ) {
		I.name = data.my_name;
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


if( DEBUG ) { socket.on("debug", function(data) { console.log(data) }) }


socket.on("update", function(data) {
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	update(data);
	draw(data);
});


// --------------------------------------------------------------------------------------------------------------------

function keyboard_on(e, position) {
	if( position === "down" ) { position = true  }
	if( position === "up"   ) { position = false }

	if( e.key === "A" || e.key === "a" || e.key === "ArrowLeft"  ) { socket.emit("key_press", { input_id: "left"  , state: position }); }
	if( e.key === "W" || e.key === "w" || e.key === "ArrowUp"    ) { socket.emit("key_press", { input_id: "up"    , state: position }); }
	if( e.key === "D" || e.key === "d" || e.key === "ArrowRight" ) { socket.emit("key_press", { input_id: "right" , state: position }); }
	if( e.key === "S" || e.key === "s" || e.key === "ArrowDown"  ) { socket.emit("key_press", { input_id: "down"  , state: position }); }
}

document.onkeydown = (e) => { keyboard_on( e , "down" ) };
document.onkeyup   = (e) => { keyboard_on( e , "up"   ) };
