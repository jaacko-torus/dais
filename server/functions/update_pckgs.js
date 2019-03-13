let world = require("../methods/world.js");
let players = world.players;


function update_pcks() {
	let pack = {};
	
	for(let player of world.players.keys()) {
		world.players.get(player).update();

		pack[player] = {
			x    : players.get(player).x,
			y    : players.get(player).y,
			img  : players.get(player).img,
			size : players.get(player).size,
		};

		return pack;
	}
}

module.exports = update_pcks;