const http = require('http');
const url = process.env.URL || 'http://127.0.0.1:9323';
const timeout = parseInt(process.env.TIMEOUT || '120000', 10); // 2 minutes timeout

function check(cb) {
  const req = http.get(url, res => {
    cb(true);
  });
  req.on('error', () => cb(false));
}

const start = Date.now();
(function wait() {
  check(up => {
    if (up) {
      console.log('Server is up:', url);
      process.exit(0);
    }
    if (Date.now() - start > timeout) {
      console.error('Timeout waiting for server:', url);
      process.exit(1);
    }
    setTimeout(wait, 500);
  });
})();
