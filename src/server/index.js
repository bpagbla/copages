require("dotenv").config(); // Asegúrate de que esté lo primero

function generarAccessToken(user) {
  return jwt.sign(user, process.env.JWT_ACCESS_SECRET, { expiresIn: "15m" });
}

function generarRefreshToken(user) {
  return jwt.sign(user, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });
}

const express = require("express");
const app = express();
const cors = require("cors");
const conexion = require("../DB/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

app.use(
  cors({
    origin: "http://localhost:4200",
    methods: "GET,POST", // Métodos permitidos
    allowedHeaders: "Content-Type,Authorization", // Encabezados permitidos
    credentials: true, // Permite enviar cookies o credenciales
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const session = require("express-session");

app.use(
  session({
    secret: "secretKey",
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false, // Para desarrollo local, asegúrate de que sea false
      httpOnly: true, // Hace que la cookie solo sea accesible por el servidor
      maxAge: 3600000, // Tiempo de expiración (1 hora)
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
    if (err)
      return res.status(500).json({ error: "Error en la base de datos" });
    if (results.length === 0)
      return res.status(401).json({ message: "Usuario no encontrado" });

    const user = results[0];

    if (!password || !user.PASSWORD)
      return res.status(400).json({ error: "Contraseña inválida" });

    try {
      const passwordMatch = await bcrypt.compare(password, user.PASSWORD);
      if (!passwordMatch)
        return res.status(401).json({ message: "Contraseña incorrecta" });

      const userData = {
        id: user.ID,
        username: user.NICK,
        email: user.EMAIL,
        role: user.ROLE,
        nombre: user.NOMBRE,
        apellidos: user.APELLIDOS,
      };

      // Generamos los tokens
      const accessToken = generarAccessToken(userData);
      const refreshToken = generarRefreshToken(userData);

      // Guardamos el refresh token en la cookie httpOnly
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false, // En producción debe ser true si usas HTTPS
        sameSite: "Lax", // O "None" si usas HTTPS entre dominios distintos
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
      });

      // Respondemos con el access token y el mensaje
      return res.json({
        message: "Login exitoso",
        accessToken, // El access token para el cliente
      });
    } catch (err) {
      console.error("Error al comparar la contraseña:", err);
      res.status(500).json({ error: "Error al autenticar" });
    }
  });
});

//logout
app.post("/logout", (req, res) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: false, // en producción: true si usas HTTPS
    sameSite: "Lax",
  });

  // Si usas sesiones en express-session, puedes destruirla también:
  if (req.session) {
    req.session.destroy();
  }

  res.status(200).json({ message: "Sesión cerrada correctamente" });
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

//verificar sesion
app.get("/sesion", (req, res) => {
  console.log("Session completa:", req.session);
  if (req.session.user) {
    res.json({
      loggedIn: true,
      user: req.session.user,
    });
  } else {
    res.json({
      loggedIn: false,
    });
  }
});

//refrescar el access token
app.post("/refresh", (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res
      .status(401)
      .json({ message: "No se ha proporcionado el refresh token" });
  }

  jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, user) => {
    if (err) {
      console.error("Refresh token inválido:", err);
      return res.status(403).json({ message: "Token inválido" });
    }

    const userData = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      nombre: user.nombre,
      apellidos: user.apellidos,
    };

    const newAccessToken = generarAccessToken(userData);
    return res.json({ accessToken: newAccessToken });
  });
});

app.listen(3000, () => {
  console.log("listening on http://localhost:3000");
});
