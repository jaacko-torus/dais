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

Keep the use of the `&&` operand to a minimum

## Unreleased

## `0.2.0` - 2018-17-3
### Add
- Grid: numerical grid to not use multiples of 16

- Graphics: graphics to player

### Change

### Deprecate

### Remove

### Fix

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