const WebSocket = require('ws')
const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

const http_port = 1338;
const ws_port = 1337;

const animal_safari = require('./animal_safari.js');

let game = animal_safari.setUpNewGame();

function pushToClient(ws, type, payload) {
    console.log('pushToClient()', type, payload);
    ws.send( JSON.stringify(
        { type, payload }
    ) );
}

/*
 * The WebSocket server starts here
 */
const wss = new WebSocket.Server({ port: parseInt(ws_port) });

wss.on('connection', (ws, req) => {

    //console.log('Got connection', req);
    let myPlayer = false;

    ws.on('message', message => {
        console.log("GOT MESSAGE:", message);

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

    });
});


/*
 * The HTTP server starts here
 */

// maps file extention to MIME types
const mimeType = {
  '.ico': 'image/x-icon',
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.wav': 'audio/wav',
  '.mp3': 'audio/mpeg',
  '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf',
  '.doc': 'application/msword',
  '.eot': 'appliaction/vnd.ms-fontobject',
  '.ttf': 'aplication/font-sfnt'
};

http.createServer(function (req, res) {
  console.log(`${req.method} ${req.url}`);
  // parse URL
  const parsedUrl = url.parse(req.url);
  // extract URL path
  // Avoid https://en.wikipedia.org/wiki/Directory_traversal_attack
  // e.g curl --path-as-is http://localhost:9000/../fileInDanger.txt
  // by limiting the path to current directory only
  const sanitizePath = path.normalize(parsedUrl.pathname).replace(/^(\.\.[\/\\])+/, '');
  let pathname = path.join(__dirname, sanitizePath);
  fs.exists(pathname, function (exist) {
    if(!exist) {
      // if the file is not found, return 404
      res.statusCode = 404;
      res.end(`File ${pathname} not found!`);
      return;
    }
    // if is a directory, then look for index.html
    if (fs.statSync(pathname).isDirectory()) {
      pathname += '/index.html';
    }
    // read file from file system
    fs.readFile(pathname, function(err, data){
      if(err){
        res.statusCode = 500;
        res.end(`Error getting the file: ${err}.`);
      } else {
        // based on the URL path, extract the file extention. e.g. .js, .doc, ...
        const ext = path.parse(pathname).ext;
        // if the file is found, set Content-type and send data
        res.setHeader('Content-type', mimeType[ext] || 'text/plain' );
        res.end(data);
      }
    });
  });
}).listen(parseInt(http_port));
console.log(`Server listening on port ${http_port}`);
