const bcrypt = require("bcrypt");

const password = "user"; // La contraseña que quieres hashear
const saltRounds = 10; // El número de rondas de salt (cuanto mayor, más seguro pero más lento)

bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
  if (err) {
    console.error("Error generando el hash:", err);
    return;
  }

  console.log("Contraseña original:", password);
  console.log("Contraseña hasheada:", hashedPassword);
});
