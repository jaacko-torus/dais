# Changelog
All notable changes to this project will be documented in this file.
The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
The Security title must include another title after the category name to specify what action is being done, following the next format:

- `category`: **TITLE** description

These are the categories which the whole
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
- `object - player`: allow to move players through console(e.g. `I.move_right()`)

### Change
- `object -> entity`: make `size` a static property. *what is this?*

- `server`: I don't need to send information to clients all the time, only when they move. Remove the `setTimeout` in favor of something more efficient. *maybe?*

### Deprecate

### Remove

### Fix

### Security



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
