class entity {
	constructor(img, x = 0, y = 0) {
		this.x = x;
		this.y = y;

		this.img = img;

		this.size = 16;
	}

	update() {
		this.update_map();
	}

	update_map() {
		// update the map if entity has changed position
		let index_l =  1;
		let index_y = -PLAYER_LIST[id].y + (world.map.size - 1) / 2;
		let index_x =  PLAYER_LIST[id].x + (world.map.size - 1) / 2;

		for(let y = 0; y < world.map.size; y++) {
			for(let x = 0; x < world.map.size; x++) {
				if(world.map.data[index_l][y][x] === 1) { world.map.data[index_l][y][x] = 0; }
			}
		}

		// if location is not undefined(either 1 or 0) then mark location of player
		if(world.map.data[1][index_y] && world.map.data[1][index_y][index_x] !== undefined) { world.map.data[1][index_y][index_x] = 1; }
	}
}

module.exports = entity;