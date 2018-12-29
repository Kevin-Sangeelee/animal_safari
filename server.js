const WebSocket = require('ws')
const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

const http_port = 1338;
const ws_port = 1337;

const protocol = require('./web_protocol.js');

/*
 * The WebSocket server starts here
 */
const wss = new WebSocket.Server({ port: parseInt(ws_port) });
let client_id = 1;

wss.on('connection', (ws, req) => {

    // Let's give the socket a unique id to help us tell the
    // difference between them.
    ws.id = client_id++;

    protocol.declareConnection(ws);

    console.log('Got connection, assigned it id', ws.id);

    // Declare handler for this connection's message events.
    ws.on('message', message => {
        console.log("GOT MESSAGE:", message);

        protocol.processMessage(message, ws);
    });

    // Declare handler for this connection's close event.
    ws.on('close', e => {
        console.log('ws.onclose - ', e);
        protocol.deleteConnection(ws);
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
