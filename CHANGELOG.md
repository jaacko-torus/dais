# Changelog
All notable changes to this project will be documented in this file.
The format is based on [Keep a Changelog 1.0.0](http://keepachangelog.com/en/1.0.0/)
The Security CL-line (ChangeLog-line) must include another title after the tag name to specify what action is being done, following the next format:

- `tag`: **TITLE** description

These are the tags which the whole
- `bug`
- `canvas`
- `chat`
- `client`
- `debug`
- `express`
- `npm`
- `object -> entity`
- `object -> player`
- `object -> self`
- `proto`
- `server`
- `socketIO`
- `world -> camera`
- `world -> grid`
- `world -> images`
- `world -> map`
- `world -> navigation`
- `ws`

A `+` at the beginning represents higher priority. An `*` at the beginning represents less priority (long-term goal).
Keep the use of the `&&` operand to a minimum, and order from most to least important.

All emphasized fonts at the end of any CL-line indicates a comment to further explain the line. If line says *R&V* then it means that the CL-line comment should be reviewed.

## `Unreleased`
### Add
- `* world -> navigation`: allow the player to see the movements it's going to make before it does.

### Change
- `proto && ws`: in the `proto` version, there should be a change to use `ws` instead of `socketIO`
- `* object -> player`: player should not move outside of the confines of the world.
- `* world -> images`: selection of images should be based on coordinates instead of index from top left corner, going right then down.
- `* server`: the server should not give the layers dedicated for user interaction to the user, because these layers are only modified and cared about by the user.
- `* world -> map`: `layer` should change according to what the server dictates. *not sure what I meant to say*
- `* server`: I don't need to send information to clients all the time, only when they move. Remove the `setTimeout` in favor of something more efficient. *maybe?*

### Deprecate
- `* world -> camera`: `world.camera.center` and fully replace it with `world.camera.vector`, or make `center` a `get()` function(first option seems better).

### Remove

### Fix
- `* object -> player`: movement through console needs to be improved. For now the timing doesn't work all the time, and a new method of movement that can work with the server should be created, so that the client serves the server with all of the movement it is planning to do, and the server decides when the movement happens.
- `* object -> player`: make `draw()` and `update()` so that they are not static. *Is there a need?*
- `* debug && world -> navigation`: setting `world.keyboard.boolean` to `false` has no effect.
- `* debug`: if one moves to the left or up while holding the key and lets go after one is outside the map, the camera continues to move in that direction, leaving the player stranded, even if one stops holding the key, or even holds the opposite direction key and hold. *R&V*

### Security



## `0.5.2` - 2018-6-10
### Change
- `server`: `world.build` should define properties with no value as `0` instead of `undefined`, as stated in `v0.4.2`.
- `server && world -> map`: player should be rendered inside of the map instead of on top of it.
- `server`: the server should include what image it will be rendering for each player, right now in the static `player.draw`, the client decides what image to use for players other than itself.
- `npm`: now using `npm shrinkwrap`

### Fix
- `debug && world -> navigation`: setting `world.mouse.click.boolean` to `false` now works perfectly.
- `mouse`: the user is capable of changing the values of coordinates outside of the map, only in the `x` coordinates.



## `0.5.1` - 2018-6-9
### Fixed
- `++ object -> player`: not drawing all players. Due to the fact that the index of images when drawing changed in `v0.5.0`, changed to corresponding.



## `0.5.0` - 2018-6-9
### Added
- `mouse`: added function `infolog()`, for the click event.

### Changed
- `+ world -> map && mouse`: Major update. Now `world.map` consists of layers, so instead of drawing a square corresponding to the tile coordinates, I am coloring the tile of the latest layer.
- `world -> map`: values holding 1 and above represents images, 0 represents empty, and -1 and below represents types of tile selection.

### Fixed
- `mouse`: when mouse hover outside of the map, only in the `y` orientation, I get a strange error in line `321`: `Uncaught TypeError`. Caused by not declaring that there is no need to render if `world.map.data[index_l][index_y] != null`.



## `0.4.2` - 2018-6-1
### Changed
- `world -> images`: `add_width` & `add_height` in `world.preload` should be `margin_x` & `margin_y` respectively
- `debug`: whether or not the grid and camera are drawn should be up to the player. Allow player to access that through the command line.
- `world -> camera`: `world.camera.size` should automatically fire errors when number given is not a positive integer. Additionally numbers should no longer be just odd numbers, rather a new system where the border directly around the player is considered to be `0` and the current `3` is `1` is proposed.

### Fixed
- `+ world -> camera`: `world.camera.draw()` should be more universal, instead of being set to the `camera.size` of 5, it should be able to use the variable.
- `world -> map && server`: `world.map[0]` had repeated values.



## `0.4.1` - 2018-5-31
### Added
- `object -> player`: allow to move players through console(e.g. `I.move_right()`).

### Changed
- `+ world -> navigation`: the keyboard handling should be a property of `world`.
- `world -> navigation`: make `world.mouse.observe(true)` a default when initiating the app
- `+ world -> images`: image loading should be handled by a property in `world` instead of being a global.

## Deprecated
- `world -> camera`: there is no need to draw the camera limit at `(0,0)`, only draw the one following the player.



## `0.4.0` - 2018-5-30
### Added
- `world -> navigation`: support for cursor, location can be activated through `world.mouse.observe()`, which returns object with `x` & `y` values of cursor.
- `world -> navigation`: slightly darken the tile below the cursor.
- `object -> self`: created this constructor for more standardization.
- `world -> navigation`: when the mouse is clicked on a tile it should be marked differently than when hovered.

### Changed
- `world -> camera`: the camera now works perfectly. The camera will stay this way for a while. Next up there wont be a need to translate the whole grid because I will only draw what is on screen, for now through this is good enough.
- `world`: the world object has been revised so that it contains everything related to the `world`.
- `object -> player`: `player_list_update()` function should be part of each player instead of being a global.

### Fixed
- `world -> camera`: camera not following character.
- `client`: now using the newest `event.key` API as recommended by MDN
- `client`: Some debugging and reformatting has to be done in `main.js`. It should be more readable.
- `world -> camera`: when moving the camera away from the origin, the camera tries to keep itself as close to the origin.



## `0.3.0` - 2018-3-22
### Added
- `world -> camera`: first.
- `world -> graphics`: for map.
- `world -> graphics`: change `y` values so that up is positive and down is negative.

### Changed
- `debug`: `DEBUG` is now transmitted from server to client to make debugging easier.
- `object -> player`: starting position is `x:0, y:0`.
- `server && world -> graphics`: define the graphics in `I`.

## Fixed
- `world -> graphics`: Adding unnecessary image references. Some references point to nothing.



## `0.2.0` - 2018-3-19
### Added
- `world -> graphics`: for player.
- `world -> graphics`: load all images in so that they are easily accessible.
- `world -> grid`: numerical grid, to not use multiples of 16.

### Fixed
- `+ world -> graphics`: When changing `I.img`, the only change should be seen in the player, not in others.

### Security
- `Object -> player`: **CHANGE** `I.name` to `writable: false`.



## `0.1.0` - 2018-3-17
### Added
- `chat`: named users.
- `chat`: users can't change their name.
- `chat`: delivered the user id to user so that users can identify themselves in `PLAYER_LIST`.
- `world -> grid`: added first.

### Changed
- `world -> graphics`: users are now seen as black boxes instead of numbers on a screen.

- `object -> player`: now using ES6 Classes.
