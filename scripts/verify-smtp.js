import 'dotenv/config';
import nodemailer from 'nodemailer';

console.log('🔍 Checking SMTP Configuration...');
console.log(`📌 Host: ${process.env.SMTP_HOST}`);
console.log(`📌 Port: ${process.env.SMTP_PORT}`);
console.log(`📌 User: ${process.env.SMTP_USER}`);
console.log('---------------------------------------------------');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'mail.siportevent.com',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false
  }
});

console.log('⏳ Verifying connection to SMTP server...');

transporter.verify(function (error, success) {
  if (error) {
    console.error('❌ Connection failed!');
    console.error(error);
    process.exit(1);
  } else {
    console.log('✅ SMTP Connection SUCCESS!');
    console.log('   The server is ready to take our messages');
    process.exit(0);
  }
});
