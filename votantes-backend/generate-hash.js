import bcrypt from 'bcrypt';

const password = '1234';

bcrypt.hash(password, 10, (err, hash) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('Hash para 1234:', hash);
  }
});
