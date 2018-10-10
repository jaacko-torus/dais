const DEBUG  = require("../variables/debug.js");

var Entity = require("./entity.js");

var PLAYER_LIST = require("../variables/player_list.js");

var world  = require("../methods/world.js");



class Player extends Entity {
	constructor(x, y, img = 1) {
		super(img, x, y);

		this.spd = 1;

		this.commands = [];

		this.going = {
			left  : false,
			up    : false,
			right : false,
			down  : false
		};
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
		if(this.going.left  ) { this.update_cmd( "left"  ); }
		if(this.going.up    ) { this.update_cmd( "up"    ); }
		if(this.going.right ) { this.update_cmd( "right" ); }
		if(this.going.down  ) { this.update_cmd( "down"  ); }
	}

	update_pos() {
		var current = this.commands.shift();

		if( current === "left"  ) { this.x -= 1; }
		if( current === "up"    ) { this.y += 1; }
		if( current === "right" ) { this.x += 1; }
		if( current === "down"  ) { this.y -= 1; }
	}

	on_connect(ws, id) {
		PLAYER_LIST[id] = this;
		
		Object.defineProperty(this, "sent_id", { value: true, writable: false });

		console.log(`\n\tOpened connection: "${id}"`);
	}

	on_disconnect(ws, id) {
		if( this.name ) { ws_broadcast("add_to_chat", { from: { name: "/", id: "/" }, msg: `${this.name} has ended their session` }); }
		delete PLAYER_LIST[id];

		console.log(`\nClosed connection: "${id}"`);
	}
}

module.exports = Player;