const express = require("express");
const app = express();
const cors = require("cors");
const conexion = require("../DB/db");
const bcrypt = require("bcrypt");

app.use(cors());
app.use(express.json());

const session = require("express-session");

app.use(
  session({
    secret: "secretKey",
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false, // true si usas HTTPS
      maxAge: 1000 * 60 * 60, // 1 hora
    },
  })
);

//comprobar si existe usuario
app.post("/usuarioExiste", (req, res) => {
  const { username } = req.body;

  const sql = "SELECT * FROM usuario WHERE NICK = ?";
  conexion.query(sql, [username], (err, results) => {
    if (err) {
      console.error("Error al buscar usuario:", err);
      return res.status(500).json({ error: "Error en la base de datos" });
    }

    if (results.length === 0) {
      return res.json({ existe: false });
    } else {
      return res.json({ existe: true });
    }
  });
});


//sacar datos de un usuario
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  const sql = "SELECT * FROM usuario WHERE NICK = ?";

  conexion.query(sql, [username], async (err, results) => {
    if (err) {
      console.error("Error al buscar usuario:", err);
      return res.status(500).json({ error: "Error en la base de datos" });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: "Usuario no encontrado" });
    }

    const user = results[0];

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }

    // Guardar los datos del usuario en la sesión
    req.session.user = {
      id: user.ID_USUARIO,
      username: user.NICK,
      email: user.EMAIL,
      role: user.ROL,
      nombre: user.NOMBRE,
      apellidos: user.APELLIDOS,
    };

    // Puedes seguir enviando el token si lo deseas
    res.json({
      message: "Login exitoso",
      sessionUser: req.session.user,
    });
  });
});

//sacar todos los usuarios
app.get("/usuarios", (req, res) => {
  const sql = "SELECT * FROM usuario";

  conexion.query(sql, (err, results) => {
    if (err) {
      console.error("Error al obtener datos:", err);
      res.status(500).json({ error: "Error en la base de datos" });
      return;
    }

    res.json(results); // Envía los datos al cliente
  });
});

//nuevo usuario
app.post("/register", async (req, res) => {
  const { email, nick, role, nombre, apellidos, password } = req.body;

  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const sql = `
      INSERT INTO usuario (email, nick, role, nombre, apellidos, password)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const values = [email, nick, role, nombre, apellidos, hashedPassword];

    conexion.query(sql, values, (err, result) => {
      if (err) {
        console.error("Error al registrar usuario:", err);
        return res.status(500).json({ error: "Error en la base de datos" });
      }

      res.status(201).json({ message: "Usuario registrado correctamente" });
    });
  } catch (err) {
    console.error("Error al encriptar la contraseña:", err);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

app.listen(3000, () => {
  console.log("listening on http://localhost:3000");
});
