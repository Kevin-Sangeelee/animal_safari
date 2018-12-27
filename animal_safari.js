module.exports = {
    setUpNewGame,
    rollDice
}
function card(animal, score, image) {
    return {
        animal: animal,
        score: score,
        image:image
    };
}

function rollDice() {

    let die1 = Math.floor(Math.random() * 6) + 1;
    let die2 = Math.floor(Math.random() * 6) + 1;

    let binoculars = 0;
    let options = [];
    if(die1 == 6 && die2 == 6) {
        binoculars = 2;
    } else if(die1 == 6) {
        binoculars = 1;
        options.push(die2);
    } else if(die2 == 6) {
        binoculars = 1;
        options.push(die1);
    } else {
        options.push(die1);
        options.push(die2);
        options.push(die1 + die2);
        options.push(Math.abs(die1 - die2));
    }

    return( {
        die1: die1,
        die2: die2,
        binoculars: binoculars,
        moveOptions: options
    });
}

let numViewpoints = 8;
let endpoint = (numViewpoints + 1) * 7;

let cardDefinitions = [
    
    { type: 'Ostrich',   variants: [1, 1, 2] },
    { type: 'Crocodile', variants: [1, 1, 2, 3] },
    { type: 'Elephant',  variants: [1, 1, 2] },
    { type: 'Lion',      variants: [1, 1, 2] },
    { type: 'Parakeet',  variants: [1, 2, 3] },
    { type: 'Meercat',   variants: [2, 2, 3] },
    { type: 'Flamingo',  variants: [1, 2, 3] },
    { type: 'Hippo',     variants: [1, 2] },
    { type: 'Giraffe',   variants: [1, 2] },
    { type: 'Zebra',     variants: [1, 2] },
    { type: 'Warthog',   variants: [1, 1, 2] },
    { type: 'Monkey',    variants: [1, 1, 1, 2, 2] },
    { type: 'Aardvark',  variants: [1, 3] },
    { type: 'Rhino',     variants: [1] },
    { type: 'Leopard',   variants: [1] },

];

/**
 * Return an array of empty player objects.
 */
function newPlayers() {
    return [
        { id: false, cards: [], position: 0 },
        { id: false, cards: [], position: 0 },
        { id: false, cards: [], position: 0 },
        { id: false, cards: [], position: 0 }
    ];
}

function newShuffledDeck() {

    let deck = [];

    // For each animal defined in the card definitions...
    cardDefinitions.forEach( i => {
        // there is an array of scores (number of animals on the card)
        i.variants.forEach(n => {
            // Assign each card a random position within 4000 slots
            const position = Math.floor(Math.random() * 4000);
            deck[position] = (card(i.type, n))
        })
    });

    // Reduce the 4000 slots (mostly empty) to a 40 card array.
    // reduce() accumulates the result of a reducer function...
    return deck.reduce(
      // The reducer function appends the item to the array
      (arr, item) => {
        arr.push(item);
        return arr;
      }, [] ); // the last parameter ( [] ) is the initial array.
}

function setUpNewGame() {

    let deck = newShuffledDeck();

    function dealCard(arr, number = 1) {
        for(idx=0; idx < number; idx++)
            if(deck.length > 0)
                arr.push(deck.pop());
    }

    return {
        players: newPlayers(),
        deck: deck,
        viewpoints: [...Array(8)].map( x => [] ),
        dealCard: dealCard
    };
}

function playGame() {

    let game = setUpNewGame();

    console.log('New game created')
    console.log('Deck size', game.deck.length);

    game.players.forEach( p => game.dealCard(p.cards, 2) );
    game.viewpoints.forEach( vp => game.dealCard(vp, 4) );

    game.players.forEach( (p, idx) => {
        console.log('Player', idx);
        p.cards.forEach( c => console.log('  ', c.animal, c.score) );
    });

    for(idx=0; idx < 4; idx++)
        console.log(rollDice());
}

playGame();

