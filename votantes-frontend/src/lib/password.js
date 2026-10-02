// Contraseñas temporales fáciles de dictar: sin caracteres que se confunden (0/O, 1/l/I).
const LETRAS = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ";
const DIGITOS = "23456789";

export function generarPassword(largo = 10) {
  const azar = new Uint32Array(largo);
  crypto.getRandomValues(azar);
  // Letras y al final dos dígitos, para cumplir cualquier regla básica
  return Array.from(azar, (n, i) => {
    const fuente = i >= largo - 2 ? DIGITOS : LETRAS;
    return fuente[n % fuente.length];
  }).join("");
}
