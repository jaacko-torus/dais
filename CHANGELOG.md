# Changelog
All notable changes to this project will be documented in this file.
The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
The Security title must include another title after the category name to specify what action is being done, following the next format:

- `category`: **TITLE** description

These are the categories which the whole
- `bug`
- `canvas`
- `chat`
- `client`
- `debug`
- `express`
- `object -> entity`
- `object -> player`
- `object -> self`
- `server`
- `socketIO`
- `world -> camera`
- `world -> grid`
- `world -> images`
- `world -> map`
- `world -> navigation`

A `+` at the beginning represents higher priority.

Keep the use of the `&&` operand to a minimum

## `Unreleased`
### Add
- `world -> navigation`: when the mouse is clicked on a tile it should be marked differently than when hovered.

### Change
- `object -> entity`: make `size` a static property. *what is this?*
- `server`: I don't need to send information to clients all the time, only when they move. Remove the `setTimeout` in favor of something more efficient. *maybe?*

### Deprecate

### Remove

### Fix
- `object -> player`: movement through console needs to be improved. For now the timing doesn't work all the time, and a new method of movement that can work with the server should be created, so that the client serves the server with all of the movement it is planning to do, and the server decides when the movement happens.
- `+ object -> player`: make `draw()` and `update()` so that they are not static.
- `+ world -> camera`: `world.camera.draw()` should be more universal, instead of being set to the `camera.size` of 5, it should be able to use the variable.
- `debug && world -> navigation`: setting `world.keyboard.boolean` to `false` has no effect
- `debug`: if one moves to the right while holding the key and lets go after one is outside the map, the camera continues to move in that direction even if one stops holding the key, or even holds left and hold.

### Security



## `0.4.1` - 2018-30-5
### Added
- `object -> player`: allow to move players through console(e.g. `I.move_right()`).

### Change
- `+ world -> navigation`: the keyboard handling should be a property of `world`.
- `world -> navigation`: make `world.mouse.observe(true)` a default when initiating the app
- `+ world -> images`: image loading should be handled by a property in `world` instead of being a global.

## Deprecate
- `world -> camera`: there is no need to draw the camera limit at `(0,0)`, only draw the one following the player.



## `0.4.0` - 2018-30-5
### Added
- `world -> navigation`: support for cursor, location can be activated through `world.mouse.observe()`, which returns object with `x` & `y` values of cursor.
- `world -> navigation`: slightly darken the tile below the cursor.
- `object -> self`: created this constructor for more standardization.

### Changed
- `world -> camera`: the camera now works perfectly. The camera will stay this way for a while. Next up there wont be a need to translate the whole grid because I will only draw what is on screen, for now through this is good enough.
- `world`: the world object has been revised so that it contains everything related to the `world`.
- `object -> player`: `player_list_update()` function should be part of each player instead of being a global.

### Fixed
- `world -> camera`: camera not following character.
- `client`: now using the newest `event.key` API as recommended by MDN
- `client`: Some debugging and reformatting has to be done in `main.js`. It should be more readable.
- `world -> camera`: when moving the camera away from the origin, the camera tries to keep itself as close to the origin.



## `0.3.0` - 2018-22-3
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



## `0.2.0` - 2018-19-3
### Added
- `world -> graphics`: for player.
- `world -> graphics`: load all images in so that they are easily accessible.
- `world -> grid`: numerical grid, to not use multiples of 16.

### Fixed
- `+ world -> graphics`: When changing `I.img`, the only change should be seen in the player, not in others.

### Security
- `Object -> player`: **CHANGE** `I.name` to `writable: false`.



## `0.1.0` - 2018-17-3
### Added
- `chat`: named users.
- `chat`: users can't change their name.
- `chat`: delivered the user id to user so that users can identify themselves in `PLAYER_LIST`.
- `world -> grid`: added first.

### Changed
- `world -> graphics`: users are now seen as black boxes instead of numbers on a screen.

- `object -> player`: now using ES6 Classes.
