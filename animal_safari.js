
function card(animal, score, image) {
    return {
        animal: animal,
        score: score,
        image:image,
        order: Math.random()
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

let player = {
    position: 0,
    cards: []
};

let animalCount = 0;
let cardCount = 0;

let deck = [];

cardDefinitions.forEach( i => {
    console.log(i.type, i.variants);
    cardCount += i.variants.length;
    i.variants.forEach(n => {
        animalCount += n;
        deck.push(card(i.type, n))
    })
});

console.log('Cards', cardCount);
console.log('Animals', animalCount);
console.log('Deck', deck);

deck.sort( (a,b) => a.order - b.order);

console.log('Shuffled', deck);

let viewpoints = [...Array(7)].map( x => [] );
let players = [
    { colour: "Red", cards: [] },
    { colour: "Green", cards: [] },
    { colour: "Yellow", cards: [] },
    { colour: "Blue", cards: [] }
];

function dealCard(arr, number = 1) {
    for(idx=0; idx < number; idx++)
        if(deck.length > 0)
            arr.push(deck.pop());
}

players.forEach( p => dealCard(p.cards, 2) );
viewpoints.forEach( vp => dealCard(vp, 4) );

players.forEach( p => {
    console.log('Player', p.colour);
    p.cards.forEach( c => console.log('  ', c.animal, c.score) );
});

for(idx=0; idx < 10; idx++)
    console.log(rollDice());
