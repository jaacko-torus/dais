var PLAYER_LIST = require("../variables/player_list.js");

function update_pckgs() {
	let pack = {};

	for(let player in PLAYER_LIST) {
		PLAYER_LIST[player].update();

		pack[player] = {
			x    : PLAYER_LIST[player].x,
			y    : PLAYER_LIST[player].y,
			img  : PLAYER_LIST[player].img,
			size : PLAYER_LIST[player].size
		};
	}

	return pack;
}

module.exports = update_pckgs;