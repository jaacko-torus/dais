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
- `class -> entity`
- `class -> player`
- `class -> self` *self should not exist*
- `server`
- `socketIO`
- `world -> camera`
- `world -> grid`
- `world -> images`
- `world -> map`
- `world -> navigation`

A `+` at the beginning represents higher priority. An `*` at the beginning represents less priority (long-term goal).
Keep the use of the `&&` operand to a minimum, and order from most to least important.

All emphasized fonts at the end of any CL-line indicates a comment to further explain the line. If line says *R&V* then it means that the CL-line comment should be reviewed.

## `Unreleased`
### Add
- `* world -> navigation`: allow the player to see the movements it's going to make before it does.

### Change
- `class -> player`: player should not move outside of the confines of the world.
- `* world -> images`: selection of images should be based on coordinates instead of index from top left corner, going right then down.
- `* server`: the server should not give the layers dedicated for user interaction to the user, because these layers are only modified and cared about by the user.
- `* world -> map`: `layer` should change according to what the server dictates. *not sure what I meant to say*
- `* server`: I don't need to send information to clients all the time, only when they move. Remove the `setTimeout` in favor of something more efficient. *maybe?*

### Deprecate
- `* world -> camera`: `world.camera.center` and fully replace it with `world.camera.vector`, or make `center` a `get()` function(first option seems better).

### Remove

### Fix
- `* class -> player`: movement through console needs to be improved. For now the timing doesn't work all the time, and a new method of movement that can work with the server should be created, so that the client serves the server with all of the movement it is planning to do, and the server decides when the movement happens. *might cause a security threat?*
- `* class -> player`: make `draw()` and `update()` so that they are not static. *Is there a need?*
- `+ debug && world -> navigation`: setting `world.keyboard.boolean` to `false` has no effect.
- `* debug`: if one moves to the left or up while holding the key and lets go after one is outside the map, the camera continues to move in that direction, leaving the player stranded, even if one stops holding the key, or even holds the opposite direction key and hold. *R&V*

### Security