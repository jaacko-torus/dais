const chat = {
	area  : document.getElementById("chatarea"),
	form  : document.getElementById("chatform"),
	input : document.getElementById("chatinput")
}

var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

canvas.width  = 336;// document.body.clientWidth;
canvas.height = 336;// document.body.clientHeight;

ctx.font = "30px Arial";


// ------------------------------------------------------------


var PLAYER_LIST = [];

var atlas = {
	map    : { src: "./img/map.png", add_width: 1, add_height: 1 },
	player : { src: "./img/player.png", add_height: 1 }
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


// ------------------------------------------------------------


/* classes */

class entity {
	constructor(x, y, size) {
		this.x    =    x;
		this.y    =    y;
		this.size = size;
	}
// 	set size( size ) { var size = size }
// 	get size() { return size }
}

var PLAYER_LIST = {};

class player extends entity {
	constructor(x, y, size) {
		super(x, y, size);
	}
	
	static update(data) {
		//  loop through `data`        . If the player is not in `PLAYER_LIST` and is     in `data` , then create a new player
		//  loop through `PLAYER_LIST` . If the player is     in `PLAYER_LIST` and is not in `data` , then delete it
		//  loop through `PLAYER_LIST` . If the player is     in `PLAYER_LIST` and is     in `data` , then update & draw players
		for( let id in data        ) { if( !PLAYER_LIST[id] &&  data[id] ) {        PLAYER_LIST[id] = new player(data[id].x, data[id].y, data[id].size); } }
		for( let id in PLAYER_LIST ) { if(  PLAYER_LIST[id] && !data[id] ) { delete PLAYER_LIST[id] ;                                          continue; } }
		for( let id in PLAYER_LIST ) { if(  PLAYER_LIST[id] &&  data[id] ) {        PLAYER_LIST[id] = data[id];                                          } }
	}
	
	static draw(data) {
	}
}


// ------------------------------------------------------------


var world = {};
var I = { img : 0 };

const draw = {
	world(data) {
		this.map();
// 		this.grid();
		this.players(data);
	},
	
	map() {
		for(let l = 0; l < world.map.length; l++) {
			for(let x = 0; x < world.size; x++) {
				for(let y = 0; y < world.size; y++) {
					if(atlas.map.loaded && world.map[l] && world.map[l][x] && world.map[l][x][y]) {
						ctx.drawImage(
							atlas.map,
							
							img.map[world.map[l][x][y]].x,
							img.map[world.map[l][x][y]].y,
							img.map[world.map[l][x][y]].size,
							img.map[world.map[l][x][y]].size,
							
							I.size * x,
							I.size * y,
							I.size,
							I.size
						);
					}
				}
			}
		}
	},
	
	grid() {
		for(let i = 0; i <= 50; i++) {
			ctx.beginPath();
			ctx.setLineDash([2, 2])
			ctx.moveTo( i * I.size - 0.25, 0      - 0.25 );
			ctx.lineTo( i * I.size - 0.25, 800    - 0.25 );
			ctx.lineWidth = 0.5;
			ctx.strokeStyle = "#cfcfcf";
			ctx.stroke();
			
			ctx.beginPath();
			ctx.setLineDash([2, 2])
			ctx.moveTo( 0      - 0.25, i * I.size - 0.25 );
			ctx.lineTo( 800    - 0.25, i * I.size - 0.25 );
			ctx.lineWidth = 0.5;
			ctx.strokeStyle = "#cfcfcf";
			ctx.stroke();
		}
	},
	
	players(data) {
		for( let player in PLAYER_LIST ) {
			// if player exists in `PLAYER_LIST` & `data` and his image is loaded, then render
			
			if( PLAYER_LIST[player] && data[player] && atlas.player.loaded ) {
				let player_image;
				
				if( player === I.id ) { player_image = I.img }
				if( player !== I.id ) { player_image =     0 }
// 				console.log(I.img)
				ctx.drawImage(
					atlas.player,
					
					img.player[player_image].x,
					img.player[player_image].y,
					img.player[player_image].size,
					img.player[player_image].size,
					
					I.size * PLAYER_LIST[player].x - I.size,
					I.size * PLAYER_LIST[player].y - I.size,
					I.size,
					I.size
				);
			}
		}
	}
}

function player_list_update(data) {
	//  loop through `data`        . If the player is not in `PLAYER_LIST` and is     in `data` , then create a new player
	//  loop through `PLAYER_LIST` . If the player is     in `PLAYER_LIST` and is not in `data` , then delete it
	//  loop through `PLAYER_LIST` . If the player is     in `PLAYER_LIST` and is     in `data` , then update & draw players
	for( let id in data        ) { if( !PLAYER_LIST[id] &&  data[id] ) {        PLAYER_LIST[id] = new player(data[id].x, data[id].y); } }
	for( let id in PLAYER_LIST ) { if(  PLAYER_LIST[id] && !data[id] ) { delete PLAYER_LIST[id] ;                           continue; } }
	for( let id in PLAYER_LIST ) { if(  PLAYER_LIST[id] &&  data[id] ) {        PLAYER_LIST[id] = data[id];                           } }
}


var socket = io();


socket.on("connection", function(data) {
	Object.defineProperty(I, "id", { value: data.id, writable: false });
	I.size = data.size;
	I.img  = data.img;
	
	world = data.world;
	
	load_all_atlas();
	console.info(data.msg);
});

socket.on("new_map", function(data) { world = data.world });


socket.on("add_to_chat", function(data) {
	chat.area.innerHTML += `<div id="${data}">${data.from.name}: ${data.msg}` + "</div>";
// 	alert(`you have received a new message from: ${data.from.name}`);
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


socket.on("debug", function(data) { console.log(data) });


socket.on("update", function(data) {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	
	player_list_update(data);
	draw.world(data);
});


// ------------------------------------------------------------


document.onkeydown = function(e) {
	if(e.keyCode === 37 || e.keyCode === 65) { socket.emit("key_press", { input_id: "left"  , state:  true }); } // A or left
	if(e.keyCode === 38 || e.keyCode === 87) { socket.emit("key_press", { input_id: "up"    , state:  true }); } // W or up
	if(e.keyCode === 39 || e.keyCode === 68) { socket.emit("key_press", { input_id: "right" , state:  true }); } // D or right
	if(e.keyCode === 40 || e.keyCode === 83) { socket.emit("key_press", { input_id: "down"  , state:  true }); } // S or down
};

document.onkeyup = function(e) {
	if(e.keyCode === 37 || e.keyCode === 65) { socket.emit("key_press", { input_id: "left"  , state: false }); } // A or left
	if(e.keyCode === 38 || e.keyCode === 87) { socket.emit("key_press", { input_id: "up"    , state: false }); } // W or up
	if(e.keyCode === 39 || e.keyCode === 68) { socket.emit("key_press", { input_id: "right" , state: false }); } // D or right
	if(e.keyCode === 40 || e.keyCode === 83) { socket.emit("key_press", { input_id: "down"  , state: false }); } // S or down
};