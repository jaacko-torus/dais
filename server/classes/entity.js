class entity {
	constructor(img, x = 0, y = 0) {
		this.x = x;
		this.y = y;

		this.img = img;

		this.size = 16;
	}

	update() {}
}

module.exports = entity;