import pg from './node_modules/pg/lib/index.js';
const { Client } = pg;
// Essai 1: IPv6 direct
const c = new Client({
  host: '2a05:d012:42e:5714:bff4:8ca9:f8d0:32e7',
  port: 5432,
  user: 'postgres',
  password: 'WZiG!G3RfqiDY8H',
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
});
c.connect().then(() => { console.log('OK IPv6'); c.end(); }).catch(e => console.log('FAIL IPv6:', e.message));
