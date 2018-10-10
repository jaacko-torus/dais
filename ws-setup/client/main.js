// if browser doesn"t support WebSocket, just show some notification and exit
if(!window.WebSocket) {
	console.log("Sorry, but your browser doesn\'t support WebSockets.")
}


// open connection
let HOST = location.origin.replace(/^http/, "ws");
let ws = new WebSocket(HOST);


// ----------------------------------------------------------------------------------------------------------------------


function ws_send(event, data) { ws.send(JSON.stringify({event, data})); }

ws.onopen = () => {
	console.log("Do something when server opens");
	ws_send("client_message", "hey");
};

ws.onerror = (error) => {
	console.log("Sorry, but there\"s some problem with your connection or the server is down.");
	console.log(error);
};

ws.onclose = () => {
	console.log("The server has closed")
};

// most important part - incoming messages
ws.onmessage = (message) => {
	message = JSON.parse(message.data);
	event(message.event, message.data);
};

var events = {
	["server_message"](data) {
		console.log(data);
	}
}

function event(event, data) {
	for(let type in events) {
		if(event === type) { events[event](data); }
	}
};

/**
 * This method is optional. If the server wasn"t able to respond to the
 * in 3 seconds then show some error message to notify the user that
 * something is wrong.
 */
setInterval(() => {
	if(ws.readyState !== 1) {
		console.log("Unable to communicate with the WebSocket server.");
	}
}, 3000);