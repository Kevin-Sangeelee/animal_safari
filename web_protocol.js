module.exports = {
    processMessage
}

function pushToClient(ws, type, payload) {
    console.log('pushToClient()', type, payload);
    ws.send( JSON.stringify(
        { type, payload }
    ) );
}

function processMessage(message, game, ws, myPlayer, animal_safari) {

    if(message == "HELLO") {
        pushToClient(ws, 'CHOOSE_PLAYER', game.players);
    }

    if(message == "ROLL_DICE") {
        pushToClient( ws, 'SHOW_DICE', animal_safari.rollDice() );
    }

    const match = message.match(/^CHOOSE: (.+)/);

    if(match) {
        // Get the colour that was chosen.
        const colour = match[1];

        // If a player has not already been assigned this colour...
        if( myPlayer == false && game.players.find( p => p.id === colour ) == undefined ) {
            // then assign it to a player.
            let player = game.players.find( p => p.id === false );
            player.id = colour;
            myPlayer = player;
            console.log("I choose", myPlayer);
            pushToClient(ws, 'PLAYER_CONFIRMED', myPlayer);
        } else {
            console.log("I attempt to choose", colour, "but I already chose", myPlayer);
        }
    }
}

