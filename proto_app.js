process.title = "the_dais"

/* debug */

const DEBUG = require("./server/variables/debug.js");

/* dependencies */

var express = require("express");
var web_socket = require("ws");
var express_host;

var app     = express();
// var http_server  = require("http").createServer(app);
// var io      = require("socket.io").listen(server);

var world   = require("./server/methods/world.js");
var Player  = require("./server/classes/proto-player");
var PLAYER_LIST = require("./server/variables/player_list.js");
var update_pckgs = require("./server/functions/update_pckgs.js");

/* routing */

console.info("Server started.");

app.get("/", (req, res) => {
	res.sendFile(`${__dirname}/client/index.html`);
	express_host = req.headers.host;
});

app.use(express.static("client"));

// http_server or live_server
var server = app.listen(process.env.PORT || 8080, () => {
	console.info("Now listening on port 8080\n");


	// --------------------------------------------------------------------------------------------------------------------


	/* make the world once, after server is listening */
	world.make(world.size, world.size, world.layer.size);

	if(world.map) { console.info("The world has been made"); }
});

// live_server
var wss = new web_socket.Server({server});


// --------------------------------------------------------------------------------------------------------------------


var ws_emit = (ws, event, data) => {
	if(ws.readyState === web_socket.OPEN) {
		ws.send(JSON.stringify({event, data}));
	}
}

var ws_broadcast = (event, data) => {
	wss.clients.forEach((client) => {
		if(client.readyState === web_socket.OPEN) {
			client.send(JSON.stringify({event, data}));
		}
	});
};

// on connection, if same origin
wss.on("connection", (ws, conn) => { if(conn.headers.host === express_host) {
	let id = conn.headers["sec-websocket-key"];
	let p  = new Player();

	ws_emit(ws, "connection", {
		world : {
			DEBUG ,
			map   : world.map   ,
			size  : world.size  ,
			layer : world.layer ,
			msg   : `You are now connected!\nYour session id is now: ${id}`,
		},
		me    : {
			id    ,
			x     : this.x      ,
			y     : this.y      ,
			size  : this.size   ,
			img   : this.img
		},
	});

	p.on_connect(ws, id);

	ws.on("message", (message) => {
		message = JSON.parse(message);
		event(ws, message.event, message.data);
	});

	ws.on("close", (code) => {
		console.log("Code: " + code);
		p.on_disconnect(ws, id);
	});

	ws.on("error", (data) => {
		console.log("Connection error: " + data);
	});
}});

wss.on("error", (data) => {
	console.log("Error: " + data);
});

function event(ws, event, data) {
	for(let type in events) {
		if(event === type) { events[event](ws, data); }
	}
}

function exec_debug(ws, p, data) {
	if( DEBUG === true && data.msg[0] === ";" ) {
		ws_emit(ws, "add_to_chat", { from: { name: ";", id: ";" }, msg: "You have issued a command" });
		return eval(data.msg.substr(1));
	}
}

function emit_debug(ws, p, data) { ws_emit(ws, "debug", data.msg); }

const events = {
	["client_message"](ws, data) {
		console.log(data);
	},
	["send_msg_to_server"](ws, data) {
		if(data.from.id === id && data.msg[0] !== ";") {  // if user has matching credentials
			//  if user has a name & it matches provided name, then broadcast message
			//  if user has a name & it doesn't match provided name, then tell them they can't do that and refuse to send message
			//  if name hasn't been set, then set the name and send message

			if(  p.name && data.from.name === p.name ) { ws_broadcast("add_to_chat", { from: {name: p.name}, msg: data.msg }); }
			if(  p.name && data.from.name !== p.name ) { ws_emit(ws, "add_to_chat", { from: {name: ";", id: ";" }, msg: "You can't change your name!", my_name: p.name }); }
			if( !p.name ) {
				Object.defineProperty(p, "name", { value: data.from.name, writable: false });
				ws_emit(ws, "add_to_chat", { from: { name: ";" , id: ";" }, msg: `Your session name is now: ${p.name}`, my_name: p.name });
				ws_broadcast("add_to_chat", { from: { name: p.name }, msg: data.msg });
			}
		}

		if(data.from.id !== p.id) {} // disconnect, nothing yet

		exec_debug(ws, p, data); // run command
	},
	["move"](ws, direction) {
		if( direction === "left"  ) { PLAYER_LIST[ws].going.left  += 1; }
		if( direction === "up"    ) { PLAYER_LIST[ws].going.up    += 1; }
		if( direction === "right" ) { PLAYER_LIST[ws].going.right += 1; }
		if( direction === "down"  ) { PLAYER_LIST[ws].going.down  += 1; }
		console.log(`Just pressed ${direction}`);
	}
}


/* sockets */

// io.sockets.on("connection", (socket) => {
// 	function exec_debug(socket, p, data) {
// 		if( DEBUG === true && data.msg[0] === ";" ) {
// 			socket.emit("add_to_chat", { from: { name: ";", id: ";" }, msg: "You have issued a command" });
// 			return eval(data.msg.substr(1));
// 		}
// 	}
	
// 	function emit_debug(socket, p, data) { socket.emit("debug", data.msg); }


// 	let id = socket.id;
// 	let p  = new Player();

// 	p.on_connect(socket, id);

// 	socket.on("disconnect", () => {
// 		p.on_disconnect(socket, id);
// 	});

// 	socket.on("send_msg_to_server", (data) => {
// 		if(data.from.id === id && data.msg[0] !== ";") {  // if user has matching credentials
// 			//  if user has a name & it matches provided name, then broadcast message
// 			//  if user has a name & it doesn't match provided name, then tell them they can't do that and refuse to send message
// 			//  if name hasn't been set, then set the name and send message

// 			if(  p.name && data.from.name === p.name ) { socket.broadcast.emit("add_to_chat", { from: {name: p.name}, msg: data.msg }); }
// 			if(  p.name && data.from.name !== p.name ) { socket.emit("add_to_chat", { from: {name: ";", id: ";" }, msg: "You can't change your name!", my_name: p.name }); }
// 			if( !p.name  ) {
// 				Object.defineProperty(p, "name", { value: data.from.name, writable: false });
// 				socket.emit("add_to_chat", { from: { name: ";" , id: ";" }, msg: `Your session name is now: ${p.name}`, my_name: p.name });
// 				socket.broadcast.emit("add_to_chat", { from: { name: p.name }, msg: data.msg });
// 			}
// 		}

// 		if(data.from.id !== p.id) {} // disconnect, nothing yet

// 		exec_debug(socket, p, data); // run command
// 	});
// });


// --------------------------------------------------------------------------------------------------------------------


/* packages */

setInterval(() => {
	var pack = update_pckgs();
	
	ws_broadcast("update", pack);
}, ( 1000/10 ) ); // prev 1000 / 8
