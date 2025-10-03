const pool = require('./config/database');

async function updateEmail() {
  await pool.query('UPDATE users SET email = $1 WHERE id = 1', ['veillemedia64@gmail.com']);
  console.log('Email mis à jour');
  process.exit(0);
}

updateEmail();
