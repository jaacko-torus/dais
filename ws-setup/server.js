process.title = "node-chat";

const express = require("express");
const WebSocketServer = require("ws").Server;


var express_host;

let app = express();

app.get("/", (req, res) => {
	res.sendFile(`${__dirname}/client/index.html`);
	express_host = req.headers.host;
});

app.use(express.static("client"));

let server = app.listen(8080, () => {
	console.log("Example app listening on port 8080!");
});

let wss = new WebSocketServer({server});


// ----------------------------------------------------------------------------


function ws_send(ws, event, data) { ws.send(JSON.stringify({event, data})); }

// on connection, if same origin
wss.on("connection", (ws, conn) => { if(conn.headers.host === express_host) {
	ws.on("message", (message) => {
		message = JSON.parse(message);
		event(ws, message.event, message.data);
	});

	ws.on("close", (data) => {
		console.log("Closing: " + data);
	});

	ws.on("error", (data) => {
		console.log("Connection error: " + data);
	});

	setInterval(() => ws_send(ws, "server_message", `${new Date()}`), 1000);
}});

wss.on("error", (data) => {
	console.log("Error: " + data);
});

function event(ws, event, data) {
	for(let type in events) {
		if(event === type) { events[event](ws, data); }
	}
}

const events = {
	["client_message"](ws, data) {
		console.log(data);
	}
}