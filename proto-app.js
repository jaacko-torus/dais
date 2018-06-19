/* debug */

// const DEBUG = true;
const DEBUG = require("./server/variables/debug.js");

/* dependencies */

var express = require("express");
var app     = express();
var server  = require("http").createServer(app);
var io      = require("socket.io").listen(server);

var world   = require("./server/methods/world.js");
var player  = require("./server/classes/proto-player");
var update_pckgs = require("./server/functions/update_pckgs.js");

/* routing */

console.info("Server started.");

app.get("/", function(req, res) {
	res.sendFile( __dirname + "/client/index.html" );
});

app.use(express.static("client"));

server.listen(process.env.PORT || 8080, () => {
	console.info("Now listening on port 8080\n");


	// --------------------------------------------------------------------------------------------------------------------


	/* make the world once, after server is listening */
	world.make(world.size, world.size, world.layer.size);

	if(world.map) { console.info("The world has been made"); }
});


// --------------------------------------------------------------------------------------------------------------------


/* sockets */

io.sockets.on("connection", (socket) => {
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
				socket.emit("add_to_chat", { from: { name: ";" , id: ";" }, msg: `Your session name is now: ${p.name}`, my_name: p.name });
				socket.broadcast.emit("add_to_chat", { from: { name: p.name }, msg: data.msg });
			}
		}

		if(data.from.id !== p.id) {} // disconnect, nothing yet

		exec_debug(socket, p, data); // run command
	});
});

function exec_debug(socket, p, data) {
	if( DEBUG === true && data.msg[0] === ";" ) {
		socket.emit("add_to_chat", { from: { name: ";", id: ";" }, msg: "You have issued a command" });
		return eval(data.msg.substr(1));
	}
}

function emit_debug(socket, p, data) { socket.emit("debug", data.msg) }


// --------------------------------------------------------------------------------------------------------------------


/* packages */

setInterval(() => {
	var pack = update_pckgs();
	
	io.emit("update", pack);
}, ( 1000/10 ) ); // prev 1000 / 8
