// const http = require('node:http');
// const url = require('node:url');

// const config = require('./config.json');

// const hostname = config.hostname; // or 'localhost'
// const port = config.port;

// const server = http.createServer((req, res) => {
// res.setHeader('Access-Control-Allow-Origin', '*'); // Allow all origins
// res.setHeader('Access-Control-Allow-Headers', '*');
// res.writeHead(200, { 'Content-Type': 'text/plain' });

//     const parsedUrl = url.parse(req.url, true);
//     let pathname = parsedUrl.pathname; // Get the path after the hostname

//     // Handle favicon requests
//     if (pathname === '/favicon.ico') {
//         return res.end();
//     }

//     // Check if the path is empty
//     if (pathname === '/') {
//         return res.end('No path provided. Please provide a path after the base URL.');
//     }

//     pathname = pathname.replace('/', '');
//     pathname = decodeURIComponent(pathname);

//     console.log(`[proxy]: requested "${pathname}"`);

//     try {
//         fetch(pathname)
//             .then(r => r.text())
//             .then(r => res.end(r));
//     } catch (error) {
//         console.error('[proxy]: error: ', error.message);
//     }
// });

// server.listen(port, hostname, () => {
//     console.log(`proxy running at http://${hostname}:${port}/`);
// });


const http = require('node:http');
const url = require('node:url');

const config = require('./config.json');
const { json } = require('node:stream/consumers');

const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); // Allow all origins
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.writeHead(200, { 'Content-Type': 'text/plain' });

    const parsedUrl = url.parse(req.url, true);
    let pathname = parsedUrl.pathname;
    const queryParams = parsedUrl.query;

    let fetchUrl;

    // Determine the URL to fetch
    switch (pathname) {
        case '/':
            return res.end('No path provided. Please provide a path after the base URL.');

        case '/favicon.ico': return res.end();

        case '/q/':
            fetchUrl = queryParams.url;
            break;

        default:
            fetchUrl = pathname.replace('/q/', '');
            break;
    }

    // Decode the URL
    try {
        fetchUrl = decodeURIComponent(fetchUrl);
    } catch (error) {
        res.end(JSON.stringify({ error: true, message: error.message }));
    }

    console.log(`[proxy]: requested "${fetchUrl}"`);

    // Fetch the content from the target URL
    fetch(fetchUrl)
        .then(r => r.text())
        .then(r => res.end(r))
        .catch(error => {
            console.error('[proxy]: fetch error: ', error.message);
            res.end(JSON.stringify({ error: true, message: error.message }));
        });
});

server.listen(config.port, config.hostname, () => {
    console.log(`Proxy running at http://${config.hostname}:${config.port}/`);
});
