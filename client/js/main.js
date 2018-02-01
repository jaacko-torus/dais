var chatArea  = document.getElementById("chatarea");
var chatForm  = document.getElementById("chatform");
var chatInput = document.getElementById("chatinput");

var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

canvas.width  = 500;//window.innerWidth;
canvas.height = 500;//window.innerHeight;

ctx.font = "30px Arial";



var socket = io();

socket.on("addToChat", function(data) {
	chatArea.innerHTML += "<div>" + data + "</div>";
});

chatForm.onsubmit = function(e) {
	e.preventDefault();
	socket.emit("sendMsgToServer", chatInput.value);
	chatInput.value = "";
};

socket.on("newPositions", function(data) {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	
	for(let i = 0; i < data.player.length; i++) {
		ctx.fillText(
			data.player[i].number,
			data.player[i].x,
			data.player[i].y
		);
	}
	
// 	for(let i = 0; i < data.bullet.length; i++) {
// 		ctx.fillRect(data.bullet[i].x - 5, data.bullet[i].y - 5, 10, 10);
// 	}
});

socket.on("test", function(data) {
	console.log(data);
});

document.onkeydown = function(e) {
	if(e.keyCode === 37 || e.keyCode === 65) { socket.emit("keyPress", { inputId: "left"  , state:  true }) } // A or left
	if(e.keyCode === 38 || e.keyCode === 87) { socket.emit("keyPress", { inputId: "up"    , state:  true }) } // W or up
	if(e.keyCode === 39 || e.keyCode === 68) { socket.emit("keyPress", { inputId: "right" , state:  true }) } // D or right
	if(e.keyCode === 40 || e.keyCode === 83) { socket.emit("keyPress", { inputId: "down"  , state:  true }) } // S or down
};

document.onkeyup = function(e) {
	if(e.keyCode === 37 || e.keyCode === 65) { socket.emit("keyPress", { inputId: "left"  , state: false }) } // A or left
	if(e.keyCode === 38 || e.keyCode === 87) { socket.emit("keyPress", { inputId: "up"    , state: false }) } // W or up
	if(e.keyCode === 39 || e.keyCode === 68) { socket.emit("keyPress", { inputId: "right" , state: false }) } // D or right
	if(e.keyCode === 40 || e.keyCode === 83) { socket.emit("keyPress", { inputId: "down"  , state: false }) } // S or down
};