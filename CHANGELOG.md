	# Changelog
All notable changes to this project will be documented in this file.
The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
The Security title must include another title after the category name to specify what action is being done, following the next format:
	- Category: TITLE description

These are the categories which the whole 
- Canvas
- Chat
- Client
- Express
- Graphics
- Grid
- Object -> `entity`
- Object -> `player`
- Server
- SocketIO

A `+` at the beginning represents higher priority.

Keep the use of the `&&` operand to a minimum

## `Unreleased`
### Add

### Change
- Graphics: make `x:0,y:0` to be the center of canvas instead of top left corner

- Object -> `entity`: make size a static property

### Deprecate

### Remove
- Grid: no need for it any longer

### Fix
- Graphics: Adding unnecesary image references. Some references point to nothing.

### Security



## `0.3.0` - 2018-19-3
### Added
- Graphics: for map

### Changed
- Server `&&` Graphics: define the graphics in `I`



## `0.2.0` - 2018-19-3
### Added
- Graphics: for player
- Graphics: load all images in so that they are easily accesible

- Grid: numerical grid, to not use multiples of 16

### Fix
- `+` Graphics: When changing `I.img`, the only change should be seen in the player, not in others.

### Security
- Object -> `player`: CHANGE `I.name` to `writable: false`



## `0.1.0` - 2018-17-3
### Added
- Chat: named users
- Chat: users can't change their name
- Chat: delivered the user id to user so that users can identify themselves in `PLAYER_LIST`

- Graphics: added a grid

### Changed
- Graphics: users are now seen as black boxes instead of numbers on a screen
- Player Object: now using ES6 Classes