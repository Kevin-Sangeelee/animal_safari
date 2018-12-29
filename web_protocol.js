module.exports = {
    declareConnection,
    processMessage,
    deleteConnection
}

const animal_safari = require('./animal_safari.js');
let game = animal_safari.setUpNewGame();

const connections = [];


function pushToClient(ws, type, payload) {
    console.log('pushToClient()', type, payload);
    ws.send( JSON.stringify(
        { type, payload }
    ) );
}

function newGame() {
    game = animal_safari.setUpNewGame();
}

/**
 * Called to declare the creation of a new connection, which
 * is stored in connections by the id, storing the ws object
 * and, later, to hold the player state information.
 */
function declareConnection(ws) {
    connections[ws.id] = { ws };
}

function deleteConnection(ws) {
    delete connections[ws.id];
}

function getPlayer(ws) {
    return connections[ws.id].player;
}

/**
 * @function playerColourChosen
 *
 * Handle the message sent by the browser when a player chooses a
 * colour and declares their name to the game.
 *
 * @param {string} message - sent by player to choose colour & name.
 * @param {Object} ws - the socket on which the message was received.
 */
function playerColourChosen(message, ws) {

    // Got message CHOOSE (player chooses a colour and declares name)
    const match = message.match(/^CHOOSE: (.+) for (.+)/);

    if(match) {
        // Get the colour that was chosen.
        const colour = match[1];
        const name = match[2];

        const myPlayer = getPlayer(ws);

        // If a player has not already been assigned this colour...
        if( myPlayer == undefined && game.players.find( p => p.id === colour ) == undefined ) {
            
            // then get the first free player object from the game.
            let player = game.players.find( p => p.id === false );

            // Make it ours (the connection owner's)
            player.id = colour;
            player.name = name;

            // Store the player in the connection object.
            connections[ws.id].player = player;

            // Notify the player that the choice has been confirmed.
            pushToClient(ws, 'PLAYER_CONFIRMED', player);
            console.log( player.name, " chooses", player);

        } else {
            console.log("I attempt to choose", colour, "but I already chose", myPlayer);
        }
    }
}

/**
 * @function processMessage
 *
 * Processes incoming messages and responds, or delegates to a helper
 * message for more complex processing (to keep this main function
 * brief and easy to read.
 *
 * @param {string} message - the text message received.
 * @param {Object} ws - the socket originating the message.
 */
function processMessage(message, ws) {

    console.log(message);
    console.log(ws);

    // Got message HELLO
    if(message == "HELLO") {
        pushToClient(ws, 'CHOOSE_PLAYER', game.players);
    }

    // Got message ROLL_DICE
    if(message == "ROLL_DICE") {
        pushToClient( ws, 'SHOW_DICE', animal_safari.rollDice() );
    }

    if(message.indexOf('CHOOSE:') == 0) {
        playerColourChosen(message, ws);
    }
}

