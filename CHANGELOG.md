	# Changelog
All notable changes to this project will be documented in this file.
The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
The Security title must include another title after the category name to specify what action is being done, following the next format:
	- Category: TITLE description

These are the categories which the whole 
- `canvas`
- `canvas -> camera`
- `canvas -> graphics`
- `canvas -> grid`
- `canvas -> map`
- `chat`
- `client`
- `debug`
- `express`
- `object -> entity`
- `object -> player`
- `server`
- `socketIO`

A `+` at the beginning represents higher priority.

Keep the use of the `&&` operand to a minimum

## `Unreleased`
### Add

### Change
- `object -> entity`: make size a static property.
- `object -> player`: `player_list_update()` function should be part of each player instead of being a global.

- `server`: I don't need to send information to clients all the time, only when they move. Remove the `setTimeout` in favour of something more efficient.

### Deprecate

### Remove

### Fix
- `canvas -> camera`: when moving the camera away from the origin, the camera tries to keep itself as close to the origin.

### Security



## `0.3.0` - 2018-22-3
### Added
- `canvas -> camera`: first.
- `canvas -> graphics`: for map.
- `canvas -> graphics`: change `y` values so that up is positive and down is negative.

### Changed
- `debug`: `DEBUG` is now transmited from server to client to make debugging easier.

- `object -> player`: starting position is `x:0, y:0`.

- `server && canvas -> graphics`: define the graphics in `I`.

## Fix
- `canvas -> graphics`: Adding unnecesary image references. Some references point to nothing.



## `0.2.0` - 2018-19-3
### Added
- `canvas -> graphics`: for player.
- `canvas -> graphics`: load all images in so that they are easily accesible.
- `canvas -> grid`: numerical grid, to not use multiples of 16.

### Fix
- `+ canvas -> graphics`: When changing `I.img`, the only change should be seen in the player, not in others.

### Security
- `Object -> player`: CHANGE `I.name` to `writable: false`.



## `0.1.0` - 2018-17-3
### Added
- `chat`: named users.
- `chat`: users can't change their name.
- `chat`: delivered the user id to user so that users can identify themselves in `PLAYER_LIST`.

- `canvas -> grid`: added first.

### Changed
- `canvas -> graphics`: users are now seen as black boxes instead of numbers on a screen.

- `object -> player`: now using ES6 Classes.