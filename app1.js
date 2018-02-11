var express = require("express");
var app = express();
var server = require("http").Server(app);

app.get("/", function(req, res) {
	res.sendFile( __dirname + "/client/index.html" );
});

app.use(express.static("client"));

server.listen(8080);
console.log("Server started.");

function testOnClient(event, data) {
	for(let i in SOCKET_LIST){
		var socket = SOCKET_LIST[i];
		socket.emit(event, data);
	}
}

var SOCKET_LIST = {};

// [Entity]

var Entity = function() {
	this.x    = 250;
	this.y    = 250;
	this.spdX = 0;
	this.spdY = 0;
};

Entity.prototype.update = function() {
	this.updatePosition();
};

Entity.prototype.updatePosition = function() {
	this.x += this.spdX;
	this.y += this.spdY;
};

Entity.prototype.list = {};

Entity.prototype.loadEntity = function(id, entity = this) {
	Entity.prototype.list[id] = entity;
};

// [Player]

var Player = function(id) {	
	Entity.call(this);
	
	this.number = Math.floor(10 * Math.random());
	this.maxSpd = 10;
	
	this.pressing = {
		left  : false,
		up    : false,
		right : false,
		down  : false
	}
};
Player.prototype = Object.create(Entity);
Player.prototype.constructor = Player;

Player.prototype.update = function() {
	this.updateSpd();
	Entity.prototype.update();
};

Player.prototype.updateSpd = function(id) {
	for(let i in this.list) {
		if(i === id){}
	}
	console.log(this);
// 	if( this.pressing.left  ) { this.spdX = -this.maxSpd; }
// 	if( this.pressing.up    ) { this.spdY = -this.maxSpd; }
// 	if( this.pressing.right ) { this.spdX =  this.maxSpd; }
// 	if( this.pressing.down  ) { this.spdY =  this.maxSpd; }
	
// 	if(!(
// 			this.pressing.left  ||
// 			this.pressing.up    ||
// 			this.pressing.right ||
// 			this.pressing.down
// 			)
// 		) {
// 				this.spdX = 0;
// 				this.spdY = 0;
// 			}
};

Player.prototype.onKeyPress = function(socket) {
	socket.on("keyPress", function(data) {
// 		~bug
// 		the next four lines should work fine and substitue the switch statement but it doesn't
// 		if( data.inputId = "left"  ) { this.pressing.left  = data.state };
// 		if( data.inputId = "up"    ) { this.pressing.up    = data.state };
// 		if( data.inputId = "right" ) { this.pressing.right = data.state };
// 		if( data.inputId = "down"  ) { this.pressing.down  = data.state };
		
// 		switch(data.inputId) {
// 			case "left":
// 			this.pressing.left  = data.state;
// 				break;
// 			case "up":
// 			this.pressing.up    = data.state;
// 				break;
// 			case "right":
// 			this.pressing.right = data.state;
// 				break;
// 			case "down":
// 			this.pressing.down  = data.state;
// 				break;
// 		}
	});
};

Player.prototype.onConnect = function(socket) {
	this.loadPlayer(socket.id);
	this.onKeyPress(socket);
};

Player.prototype.onDisconnect = function(socket) {
	delete SOCKET_LIST[socket.id];
	
	delete Entity.list[socket.id];
	delete Player.list[socket.id];
};

Player.prototype.updatePack = function() {
	var pack = {};
	for(let i in Player.prototype.list) {
		var player = Player.list[i];
		
		player.update();
		pack.push({
			x      : player.x,
			y      : player.y,
			number : player.number
		})
	}
	return pack;
};

Player.prototype.list = {};
Player.prototype.loadPlayer = function(id) {
// 	load player into the entity list
	Entity.prototype.loadEntity(id, this);
// 	Entity.loadEntity.call(this, id, this);
// 	load player into the player list
	Player.prototype.list[id] = this;
};


var io = require("socket.io")(server, {});

io.sockets.on("connection", function(socket) {
	socket.id = Math.random();
	SOCKET_LIST[socket.id] = socket;
	
	var p = new Player();
	p.onConnect(socket);
	
	console.log(p.list);
	
	socket.on("disconnect", function() {
		p.onDisconnect(socket);
	});
	
	socket.on("sendMsgToServer", function(data) {
		var playerName = socket.id;
		
		for(let i in SOCKET_LIST) {
			SOCKET_LIST[i].emit("addToChat", playerName + ": " + data);
		}
	});
});

setInterval(function() {
	var pack = {
		player: Player.prototype.update()
	}
	
	for(let i in SOCKET_LIST){
		var socket = SOCKET_LIST[i];
		socket.emit("newPositions", pack);
	}
}, 1000/30);