const http = require('http');
const server = http.createServer((req, res) => { res.writeHead(200, {'Content-Type':'text/plain'}); res.end('ok'); });
server.listen(5173, '127.0.0.1', () => console.log('test server listening on 127.0.0.1:5173'));
setTimeout(()=>server.close(()=>console.log('server closed')), 15000);
