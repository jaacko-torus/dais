# Map Layers

`world.map.data` holds the data which will later be rendered. Instead of drawing things based of data that the objects hold, which consumes more processing, hold all data in `world.map.data`. From there everything is drawn. There will be an object in the near future which will be called `layer_indexing` which will be reset by the server if necesary, and will hold if data is in which type of layer. At the moment there are four types of layers, although only three have been implemented, and one has not all the way.

## `bottom layer`
Also called `layer 0`. Dedicated to terrain tiles. Grass, water, mud, and such.

## `mid-bottom layers` - *yet to come*
These sustain all entities which don't move, includes plants, housing, props, mines, and such.

## `mid-top layers` - *only base, no props yet*
These layers hold movable entities, such as players, animals, boats, machines, and others. Also hold their props, such as clothes.

## `top layer`
Sometimes called `layer -1`. Dedicated only to mouse events