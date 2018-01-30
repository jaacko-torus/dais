var canvas = document.getElementById("canvas");
var ctx    = canvas.getContext("2d");
canvas.width  = 500;
canvas.height = 500;


// --


var fps = 60;
var timestep = 1000 / fps;
var delta = 0;
var framesThisSecond = 0;
var lastFrameTimeMs = 0;
var lastFpsUpdate = 0;

var keys = [];
document.body.addEventListener("keydown", (e) => { keys[e.keyCode] = true;  });
document.body.addEventListener("keyup",   (e) => { keys[e.keyCode] = false; });


// --


class player {
	constructor() {
		this.x = 0;
		this.y = 0;
		this.width = 10;
		this.height = 10;
		this.vel_x = 0.05;
		this.vel_y = 0.05;
		this.max_vel = 2;
	}
	
	movement() {
		if(keys[37] || keys[65]) {this.x -= this.vel_x * delta;} // a or left
		if(keys[38] || keys[87]) {this.y -= this.vel_y * delta;} // w or up
		if(keys[39] || keys[68]) {this.x += this.vel_x * delta;} // d or right
		if(keys[40] || keys[83]) {this.y += this.vel_y * delta;} // s or down
	}
	
	update(delta) {
		this.movement();
	}
	
	render() {
		ctx.fillRect(this.x, this.y, this.width, this.height);
	}
}

var p1 = new player();


// --

// var world = {
// 	map0: [ // 20x20
		
// 	]
// }

var world = {
	clear: function() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
	},
	
	
	fps: function() {
		ctx.fillText(`${Math.round(fps)} FPS`, 10, 10);
	}
};


var atlas_loaded = false;
var loadatlas = function() {
	var img = new Image();
	img.url = "./images/world.png";
	
	img.onload = function() {
		console.log("loaded atlas");
		atlas_loaded = true;
	};
	
	return img;
}

// --

function start() {
	preload();
	
	requestAnimationFrame(loop);
}

function preload() {
	return {
		atlas: loadatlas(),
	}
}

function update(delta) {
	p1.update(delta);
}

function render() {
	world.clear();
	world.fps();
	if(atlas_loaded) {
	//	ctx.drawImage(, 0, 0, .width, .height, 0, 0, .width, .height);
	}
	
	p1.render();
}


// --

function loop(timestamp) {
	// Throttle the frame rate.

	if (timestamp < lastFrameTimeMs + timestep) {
		requestAnimationFrame(loop);
		return;
	}
	delta += timestamp - lastFrameTimeMs;
	lastFrameTimeMs = timestamp;

	
	if (timestamp > lastFpsUpdate + 1000) {
		fps = 0.25 * framesThisSecond + 0.75 * fps;
		lastFpsUpdate = timestamp;
		framesThisSecond = 0;
	}
	framesThisSecond++;

	var numUpdateSteps = 0;
	while (delta >= timestep) {
		update(timestep);
		delta -= timestep;
		if (++numUpdateSteps >= 240) {
			delta = 0;
			break;
		}
	}
	render();

	requestAnimationFrame(loop);
}

start();