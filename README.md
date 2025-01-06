# giboru
Booru client for Web

Written in vanilla JavaScript. Lightweight
# Usage
Just install all files on your web server/GitHub pages/etc. Open `index.html` and you're good to go.

## Proxy
You need to setup a CORS proxy (like [this](https://cors-anywhere.herokuapp.com/)). It's mandatory, since some booru's don't use CORS.
For easy-way: use proxy, that included with giboru (in `proxy`).
### Proxy installation
If you would use **giboru's proxy**, here are the steps:
1. Fork this repo
2. Open `proxy` folder in this repo
3. Open your terminal and type: `node server.js`
4. That's it! No npm deps!

But if you would use **custom proxy**, like [this](https://cors-anywhere.herokuapp.com/)...
1. Open settings in giboru app (top left menu icon -> Open settings)
2.  Tick "Proxy" and write proxy URL

