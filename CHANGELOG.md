	# Changelog
All notable changes to this project will be documented in this file.
The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
The Security title must include another title after the category name to specify what action is being done, following the next format:
	- Category: TITLE description

These are the categories which the whole 
- Canvas
- Canvas -> `camera`:
- Canvas -> `graphics`:
- Canvas -> `grid`:
- Canvas -> `map`:
- Chat
- Client
- Debug
- Express
- Object -> `entity`
- Object -> `player`
- Server
- SocketIO

A `+` at the beginning represents higher priority.

Keep the use of the `&&` operand to a minimum

## `Unreleased`
### Add

### Change
- Object -> `entity`: make size a static property.
- Object -> `player`: `update` function should be part of each player instead of being a global.

- Server: I don't need to send information to clients all the time, only when thet move. Remove the `setTimeout` in favour of something more efficient.

### Deprecate

### Remove

### Fix
- Canvas -> `camera`: when moving the camera away from the origin, the camera tries to keep itself as close to the origin.
- Canvas -> `graphics`: Adding unnecesary image references. Some references point to nothing.

### Security



## `0.3.0` - 2018-22-3
### Added
- Canvas -> `camera`: first.
- Canvas -> `graphics`: for map.
- Canvas -> `graphics`: change `y` values so that up is positive and down is negative.

### Changed
- Debug: `DEBUG` is now transmited from server to client to make debugging easier.

- Object -> `player`: starting position is `x:0, y:0`.

- Server `&&` Canvas -> `graphics`: define the graphics in `I`.



## `0.2.0` - 2018-19-3
### Added
- Canvas -> `graphics`: for player.
- Canvas -> `graphics`: load all images in so that they are easily accesible.
- Canvas -> `grid`: numerical grid, to not use multiples of 16.

### Fix
- `+` Canvas -> `graphics`: When changing `I.img`, the only change should be seen in the player, not in others.

### Security
- Object -> `player`: CHANGE `I.name` to `writable: false`.



## `0.1.0` - 2018-17-3
### Added
- Chat: named users.
- Chat: users can't change their name.
- Chat: delivered the user id to user so that users can identify themselves in `PLAYER_LIST`.

- Canvas -> `grid`: added first.

### Changed
- Canvas -> `graphics`: users are now seen as black boxes instead of numbers on a screen.

- Object -> `player`: now using ES6 Classes.