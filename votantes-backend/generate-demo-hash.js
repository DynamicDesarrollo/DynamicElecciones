import bcrypt from 'bcrypt';

const password = 'demo';
const saltRounds = 10;

bcrypt.hash(password, saltRounds, function(err, hash) {
  if (err) throw err;
  console.log('Hash para "demo":', hash);
});
