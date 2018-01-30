var express = require("express");
var app = express();
var server = require("http").Server(app);

app.get("/", function(req, res) {
	res.sendFile( __dirname + "/client/index.html" );
});

app.use(express.static("client"));

server.listen(3000);
console.log("Server started.");

function testOnClient(event, data) {
	for(let i in SOCKET_LIST){
		var socket = SOCKET_LIST[i];
		socket.emit(event, data);
	}
}

var SOCKET_LIST = {};

var Entity = function() {
	var self = {
		id   : "",
		x    : 250,
		y    : 250,
		spdX : 0,
		spdY : 0,
	}
	
	self.update = function() {
		self.updatePosition();
	}
	
	self.updatePosition = function() {
		self.x += self.spdX;
		self.y += self.spdY;
	}
	return self;
}

var Player = function(id) {
	var self = Entity();
	
	self.id = id;
	self.number = Math.floor(10 * Math.random());
	self.maxSpd = 10;

	self.pressing = {
		left  : false,
		up    : false,
		right : false,
		down  : false
	};
	
	var super_update = self.update;
	self.update = function() {
		self.updateSpd();
		super_update();
	}
	
	self.updateSpd = function() {
		switch(true) {
		case self.pressing.left:
			self.spdX = -self.maxSpd;
			break;
		case self.pressing.up:
			self.spdY = -self.maxSpd;
			break;
		case self.pressing.right:
			self.spdX = self.maxSpd;
			break;
		case self.pressing.down:
			self.spdY = self.maxSpd;
			break;
		default:
			self.spdX = 0;
			self.spdY = 0;
		}
	}
	
	Player.list[id] = self;
	return self;
}

Player.list = {};

Player.onConnect = function(socket) {
	var player = Player(socket.id);
	socket.on("keyPress", function(data) {
		switch(data.inputId) {
		case "left":
			player.pressing.left = data.state;
			break;
		case "up":
			player.pressing.up = data.state;
			break;
		case "right":
			player.pressing.right = data.state;
			break;
		case "down":
			player.pressing.down = data.state;
			break;
		}
	});
}

Player.onDisconnect = function(socket) {
	delete Player.list[socket.id];
}

Player.update = function() {
	var pack = [];
	for(let i in Player.list){
		var player = Player.list[i];
		
		player.update();
		pack.push({
			x      : player.x,
			y      : player.y,
			number : player.number
		});
	}
	return pack;
}


var Bullet = function(angle) {
	var self = Entity();
	
	self.id = Math.random();
	self.spdX = Math.cos(angle / 180 * Math.PI) * 10;
	self.spdY = Math.sin(angle / 180 * Math.PI) * 10;
	
	self.timer = 0;
	self.toRemove = false;
	
	var super_update = self.update;
	self.update = function() {
		if(self.timer++ > 100)
			self.toRemove = true;
		super_update();
	}
	Bullet.list[self.id] = self;
	return self;
}

Bullet.list = {};

Bullet.update = function() {
	if(Math.random() < 0.1){
		Bullet(Math.random() * 360);
	}
	
	var pack = [];
	for(let i in Bullet.list){
		var bullet = Bullet.list[i];
		
		bullet.update();
		pack.push({
			x: bullet.x,
			y: bullet.y,
		});
	}
	return pack;
};

var io = require("socket.io")(server, {});
io.sockets.on("connection", function(socket) {
	socket.id = Math.random();
	SOCKET_LIST[socket.id] = socket;
	
	Player.onConnect(socket);
	
	socket.on("disconnect", function() {
		delete SOCKET_LIST[socket.id];
		Player.onDisconnect(socket);
	});
	
	socket.on("sendMsgToServer", function(data) {
		var playerName = socket.id;
		
		for(let i in SOCKET_LIST) {
			SOCKET_LIST[i].emit("addToChat", playerName + ": " + data);
		}
	});
});

setInterval(() => {
	var pack = {
		player: Player.update(),
		bullet: Bullet.update(),
	}
	
	for(let i in SOCKET_LIST){
		var socket = SOCKET_LIST[i];
		socket.emit("newPositions", pack);
	}
}, 1000/40);