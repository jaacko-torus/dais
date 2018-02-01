# dais

## plan

app.js will have two loops:
 1 send players each other's data
 2 game simulator based of the players input

loop #1 must be as instantanius as possible (hoping for 10 per seconds). This will send all of the events to all the players in a certain radius of the player. The position of the players will be calculated by the clients.

loop #2 will be a simulation of the whole game(not just around certain players). It will keep track of all players and make sure they are not cheating and sending wrong information regarding their position.