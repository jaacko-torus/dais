const chat = {
	area  : document.getElementById("chatarea"),
	form  : document.getElementById("chatform"),
	input : document.getElementById("chatinput")
}

var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

canvas.width  = 800;// document.body.clientWidth;
canvas.height = 800;// document.body.clientHeight;

ctx.font = "30px Arial";


// ------------------------------------------------------------


var PLAYER_LIST = [];


// ------------------------------------------------------------


/* classes */

class entity {
	constructor(x, y, size) {
		this.x    =    x;
		this.y    =    y;
		this.size = size;
	}
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


var I = {};

const draw = {
	world(data) {
		this.grid();
		this.players(data);
	},
	
	grid() {
		for(let i = 0; i <= 50; i++) {
			ctx.beginPath();
			ctx.setLineDash([2, 2])
			ctx.moveTo( i * 16 - 0.25, 0      - 0.25 );
			ctx.lineTo( i * 16 - 0.25, 800    - 0.25 );
			ctx.lineWidth = 0.5;
			ctx.strokeStyle = "#cfcfcf";
			ctx.stroke();
			
			ctx.beginPath();
			ctx.setLineDash([2, 2])
			ctx.moveTo( 0      - 0.25, i * 16 - 0.25);
			ctx.lineTo( 800    - 0.25, i * 16 - 0.25);
			ctx.lineWidth = 0.5;
			ctx.strokeStyle = "#cfcfcf";
			ctx.stroke();
		}
	},
	
	players(data) {
		for( let player in PLAYER_LIST ) {
			if( PLAYER_LIST[player] && data[player] ) {
				ctx.fillRect(
					PLAYER_LIST[player].x - PLAYER_LIST[player].size,
					PLAYER_LIST[player].y - PLAYER_LIST[player].size,
					PLAYER_LIST[player].size,
					PLAYER_LIST[player].size
				);
			}
		}
	}
}

function player_list_update(data) {
	//  loop through `data`        . If the player is not in `PLAYER_LIST` and is     in `data` , then create a new player
	//  loop through `PLAYER_LIST` . If the player is     in `PLAYER_LIST` and is not in `data` , then delete it
	//  loop through `PLAYER_LIST` . If the player is     in `PLAYER_LIST` and is     in `data` , then update & draw players
	for( let id in data        ) { if( !PLAYER_LIST[id] &&  data[id] ) {        PLAYER_LIST[id] = new player(data[id].x, data[id].y, data[id].size); } }
	for( let id in PLAYER_LIST ) { if(  PLAYER_LIST[id] && !data[id] ) { delete PLAYER_LIST[id] ;                                          continue; } }
	for( let id in PLAYER_LIST ) { if(  PLAYER_LIST[id] &&  data[id] ) {        PLAYER_LIST[id] = data[id];                                          } }
}


var socket = io();


socket.on("connection", function(data) {
	I.id = data.id;
	console.info(data.msg);
});


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


socket.on("debug", function(data) { console.log(data) });


socket.on("update", function(data) {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	
	player_list_update(data);
	draw.world(data);
});


// ------------------------------------------------------------


document.onkeydown = function(e) {
	if(e.keyCode === 37 || e.keyCode === 65) { socket.emit("key_press", { input_id: "left"  , state:  true }) } // A or left
	if(e.keyCode === 38 || e.keyCode === 87) { socket.emit("key_press", { input_id: "up"    , state:  true }) } // W or up
	if(e.keyCode === 39 || e.keyCode === 68) { socket.emit("key_press", { input_id: "right" , state:  true }) } // D or right
	if(e.keyCode === 40 || e.keyCode === 83) { socket.emit("key_press", { input_id: "down"  , state:  true }) } // S or down
};

document.onkeyup = function(e) {
	if(e.keyCode === 37 || e.keyCode === 65) { socket.emit("key_press", { input_id: "left"  , state: false }) } // A or left
	if(e.keyCode === 38 || e.keyCode === 87) { socket.emit("key_press", { input_id: "up"    , state: false }) } // W or up
	if(e.keyCode === 39 || e.keyCode === 68) { socket.emit("key_press", { input_id: "right" , state: false }) } // D or right
	if(e.keyCode === 40 || e.keyCode === 83) { socket.emit("key_press", { input_id: "down"  , state: false }) } // S or down
};