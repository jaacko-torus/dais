# The Dais
`V0.1.0`

Starting script is `app.js`.

## DEBUG

In `app.js` the const `DEBUG = false` by default. This means that you will be able to type `/<command>`, `<command>` being replaced by javascript which will be `eval`ed in the server. This is done so that it is easier to debug the server. To send back information from the server to the client use `/emit_debug(socket, p, { msg: <command> })`. It is so long and explicit so that the client notices less that the function exists.

## Plan

`app.js` will have two loops:
- #1 send players each other's data
- #2 game simulator based of the players input

Loop #1 must be as instantanius as possible (hoping for 10 per seconds). This will send all of the events to all the players in a certain radius of the player. The position of the players will be calculated by the clients.

Loop #2 will be a simulation of the whole game(not just around certain players). It will keep track of all players and make sure they are not cheating and sending wrong information regarding their position.

## Changelog

The changelog can be found [`here`](CHANGELOG.md)
