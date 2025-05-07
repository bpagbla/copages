const express = require("express");
const app = express();
const cors = require("cors");
const conexion = require("../DB/db");
const bcrypt = require("bcrypt");

app.use(cors({
  origin: "http://localhost:4200",
  methods: "GET,POST", // Métodos permitidos
  allowedHeaders: "Content-Type,Authorization", // Encabezados permitidos
  credentials: true, // Permite enviar cookies o credenciales
}));
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


// Login
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  const sql = "SELECT * FROM usuario WHERE NICK = ?";

  conexion.query(sql, [username], async (err, results) => {
    console.log("Datos del usuario recibido de la DB:", results[0]);
    if (err) {
      console.error("Error al buscar usuario:", err);
      return res.status(500).json({ error: "Error en la base de datos" });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: "Usuario no encontrado" });
    }

    const user = results[0];

    // Verificar si la contraseña proporcionada y la almacenada existen y son válidas
    if (!password || !user.PASSWORD) {
      return res.status(400).json({ error: "Datos de contraseña incorrectos " });


    }

    try {
      const passwordMatch = await bcrypt.compare(password, user.PASSWORD);

      if (!passwordMatch) {
        return res.status(401).json({ message: "Contraseña incorrecta" });
      }

      // Guardar los datos del usuario en la sesión
      req.session.user = {
        id: user.ID,
        username: user.NICK,
        email: user.EMAIL,
        role: user.ROLE,
        nombre: user.NOMBRE,
        apellidos: user.APELLIDOS,
      };

      res.json({
        message: "Login exitoso",
        sessionUser: req.session.user,
      });
    } catch (err) {
      console.error("Error al comparar la contraseña:", err);
      res.status(500).json({ error: "Error al comparar la contraseña" });
    }
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
  console.log("Datos recibidos:", req.body);
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
