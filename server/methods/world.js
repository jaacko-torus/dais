let world = {
	size: 21,
	layer: {
		size: 3,
		indexing: {
			"bottom"     : "0",
			"mid_bottom" : undefined,
			"mid_top"    : "1",
			"top"        : "2",
		}
	},

	build(width, height, layer) {
		for( let l = 0; l < layer; l++ ) {
			this.map.push([]);
			for( let y = 0; y < height; y++ ) {
				this.map[l].push([]);
				for( let x = 0; x < width; x++ ) {
					this.map[l][y].push(0);
				}
			}
		}
	},

	edit(width, height, layer) {
		// all tiles in layer 0 are grass
		for(let y = 0; y < height; y++) {
			for(let x = 0; x < width; x++) {
				this.map[0][y][x] = 6;
			}
		}
	},
	
	make(width, height, layer, socket) {
		this.map = [];
		
		this.build(width, height, layer);
		this.edit(width, height, layer);
		
		if( socket ) { socket.emit("new_map", this.map); }
		return this.map;
	},
	
	find(l, x, y) {
		y = y + ((this.size - 1) / 2);
		x = x + ((this.size - 1) / 2);

		return this.map[l][y][x];
	}
};

module.exports = world;