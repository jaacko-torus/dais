const DEBUG = require("../constants/debug.js");

let entity = require("./entity.js");

let world    = require("../methods/world.js");
let entities = world.entities;
let players  = world.players;



class player extends entity {
	constructor(x, y, spd_x = 0, spd_y = 0, img = 2) {
		super(img, x, y);

		this.spd_x = spd_x;
		this.spd_y = spd_y;

		this.spd = 1;

		this.pressing = {
			left  : false,
			up    : false,
			right : false,
			down  : false
		};
	}

	update() {
		this.update_spd();
		this.update_pos();
		super.update();
	}

	update_pos() {
		this.x += this.spd_x;
		this.y += this.spd_y;
	}

	update_spd() {
		if( this.pressing.left  ) { this.spd_x = -this.spd }
		if( this.pressing.up    ) { this.spd_y =  this.spd }
		if( this.pressing.right ) { this.spd_x =  this.spd }
		if( this.pressing.down  ) { this.spd_y = -this.spd }

		if( !( this.pressing.left || this.pressing.right ) ) { this.spd_x = 0; }
		if( !( this.pressing.up   || this.pressing.down  ) ) { this.spd_y = 0; }
	}

	on_connect(socket, id) {
		entities.set(id, this);
		players.set(id, this);

		socket.on("key_press", (data) => {
			if( data.input_id === "left"  ) { this.pressing.left  = data.state }
			if( data.input_id === "up"    ) { this.pressing.up    = data.state }
			if( data.input_id === "right" ) { this.pressing.right = data.state }
			if( data.input_id === "down"  ) { this.pressing.down  = data.state }
		});

		socket.emit("connection", {
			world : {
				DEBUG ,
				map   : world.map   ,
				size  : world.size  ,
				layer : world.layer ,
				msg   : `You are now connected!\nYour session id is now: ${id}`
			},
			me    : {
				id    ,
				x     : this.x     ,
				y     : this.y     ,
				size  : this.size  ,
				img   : this.img
			},
		});
		Object.defineProperty(this, "sent_id", { value: true, writable: false });

		console.log(`\n\tOpened connection: "${id}"`);
	}

	on_disconnect(socket, id) {
		if( this.name ) { socket.broadcast.emit("add_to_chat", { from: { name: ";", id: ";" }, msg: `${this.name} has ended their session` }) }

		entities.delete(id);
		players.delete(id);

		console.log(`\nClosed connection: "${id}"`);
	}
}

module.exports = player;