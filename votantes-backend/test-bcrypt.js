import bcrypt from 'bcryptjs';

const password = 'NuevaClave123';
const hash = '$2b$10$m/anjAvnVO/XYV7fXA0Rx0Ui1PTEyB1m68F6HPLYtHsxb5.HfNTty';

bcrypt.compare(password, hash, (err, result) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('¿La contraseña es correcta?', result);
  }
});
