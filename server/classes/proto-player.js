const DEBUG  = require("../variables/debug.js");

var entity = require("./entity.js");

var PLAYER_LIST = require("../variables/player_list.js");

var world  = require("../methods/world.js");



class player extends entity {
	constructor(x, y, img = 1) {
		super(img, x, y);

		this.spd = 1;

		this.commands = [];

		this.going = {
			left  : false,
			up    : false,
			right : false,
			down  : false
		}
	}
	
	update() {
		super.update();

		this.update_spd();
		this.update_pos();
	}

	update_cmd(direction) {
		while(this.commands.length <= 5) {
			this.going[direction] -= 1;
			this.commands.push(direction);
		}
	}

	update_spd() {
		if(this.going.left  ) { this.update_cmd( "left"  ) }
		if(this.going.up    ) { this.update_cmd( "up"    ) }
		if(this.going.right ) { this.update_cmd( "right" ) }
		if(this.going.down  ) { this.update_cmd( "down"  ) }
	}

	update_pos() {
		var current = this.commands.shift();

		if( current === "left"  ) { this.x -= 1 }
		if( current === "up"    ) { this.y += 1 }
		if( current === "right" ) { this.x += 1 }
		if( current === "down"  ) { this.y -= 1 }
	}

	on_connect(socket, id) {
		PLAYER_LIST[id] = this;

		socket.on("move", (direction) => {
			if( direction === "left"  ) { this.going.left  += 1 }
			if( direction === "up"    ) { this.going.up    += 1 }
			if( direction === "right" ) { this.going.right += 1 }
			if( direction === "down"  ) { this.going.down  += 1 }
			console.log(`Just pressed ${direction}`);
		});
		
		socket.emit("connection", {
			world : {
				DEBUG : DEBUG       ,
				map   : world.map   ,
				size  : world.size  ,
				layer : world.layer ,
				msg   : `You are now connected!\nYour session id is now: ${id}`,
			},
			me    : {
				id    : id          ,
				x     : this.x      ,
				y     : this.y      ,
				size  : this.size   ,
				img   : this.img
			},
		});
		Object.defineProperty(this, "sent_id", { value: true, writable: false });

		console.log(`\n\tOpened connection: "${id}"`);
	}

	on_disconnect(socket, id) {
		if( this.name ) { socket.broadcast.emit("add_to_chat", { from: { name: "/", id: "/" }, msg: `${this.name} has ended their session` }) }
		delete PLAYER_LIST[id];

		console.log(`\nClosed connection: "${id}"`);
	}
}

module.exports = player;