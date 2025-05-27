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
const conexion = require("./DB/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const connection = require("./DB/db");

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

//comprobar si existe nombre de usuario
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

//comprobar si el email está registrado
app.post("/emailExiste", (req, res) => {
  const { email } = req.body;

  const sql = "SELECT * FROM usuario WHERE EMAIL = ?";
  conexion.query(sql, [email], (err, results) => {
    if (err) {
      console.error("Error al buscar email:", err);
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
    if (err) {
      console.error("Error al hacer la query del login:", err);
      return res.status(500).json({ error: "Error en la base de datos" });
    }

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
        pfp: user.PFP,
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

// Middleware para verificar el token
function verifyToken(req, res, next) {
  const token = req.headers["authorization"]?.split(" ")[1]; // Obtener el token del encabezado

  if (!token) {
    return res.status(403).send("Token requerido");
  }

  jwt.verify(token, process.env.JWT_ACCESS_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).send("Token inválido");
    }
    req.user = decoded; // Decodificar el token y adjuntar los datos del usuario
    next();
  });
}

// Endpoint protegido para obtener la información del usuario
app.get("/user-info", verifyToken, (req, res) => {
  console.log(req.user);
  res.json({
    id: req.user.id,
    nick: req.user.username,
    role: req.user.role,
    pfp: req.user.pfp,
  });
});

app.get("/profile/:nick", (req, res) => {
  const nick = req.params.nick;

  // 1. Consulta para obtener los datos del usuario
  const sqlUsuario =
    "SELECT nick, nombre, apellidos, pfp FROM usuario WHERE nick = ?";

  conexion.query(sqlUsuario, [nick], (err, usuarioResults) => {
    if (err) {
      console.error("Error al consultar usuario:", err);
      return res.status(500).json({ message: "Error en la base de datos" });
    }

    if (usuarioResults.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const usuario = usuarioResults[0];

    // 2. Consulta para obtener las obras publicadas por ese usuario
    const sqlObras = `
      SELECT libro.ID, libro.TITULO, libro.PORTADA, libro.DESCRIPCION
      FROM libro
      JOIN publica ON libro.ID = publica.ID_LIBRO
      JOIN usuario ON publica.ID_USUARIO = usuario.ID
      WHERE usuario.NICK = ?
    `;

    conexion.query(sqlObras, [nick], (err2, obrasResults) => {
      if (err2) {
        console.error("Error al consultar obras:", err2);
        return res.status(500).json({ message: "Error en la base de datos" });
      }
      console.log(obrasResults);
      // Enviamos la respuesta con usuario y obras
      res.json({
        nick: usuario.nick,
        nombre: usuario.nombre,
        apellidos: usuario.apellidos,
        pfp: usuario.pfp,
        obras: obrasResults, // array con las obras publicadas
      });
    });
  });
});

//endpoint para obtener los posts para el feed
app.get("/posts", verifyToken, (req, res) => {
  console.log("Entrando en GET /posts, user:", req.user);
  const userId = req.user.id; // ID del usuario autenticado

  const sql = `
    SELECT 
      l.ID AS id,
      l.TITULO AS title,
      SUBSTRING(l.DESCRIPCION, 1, 200) AS excerpt,
      c.TITULO AS capituloTitulo,
      c.ORDEN AS capituloOrden,
      c.FECHA AS date,
      u.NICK AS username
    FROM libro l
    INNER JOIN componeCapLib ccl ON ccl.ID_LIBRO = l.ID
    INNER JOIN capitulo c ON c.ID = ccl.ID_CAPITULO
    INNER JOIN publica p ON p.ID_LIBRO = l.ID
    INNER JOIN usuario u ON u.ID = p.ID_USUARIO
    INNER JOIN sigue s ON s.ID_SEGUIDO = u.ID
    WHERE s.ID_SEGUIDOR = ?
    ORDER BY c.FECHA DESC
    LIMIT 20;
  `;

  conexion.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("Error al obtener posts:", err);
      return res.status(500).json({ message: "Error al obtener posts" });
    }

    const posts = results.map((row) => ({
      id: row.id,
      title: row.title,
      excerpt: row.excerpt,
      capituloTitulo: row.capituloTitulo,
      capituloOrden: row.capituloOrden,
      date: row.date,
      author: {
        username: row.username,
      },
    }));

    res.json(posts);
  });
});

//endpoint para obtener los capitulos de un libro
app.get("/libro/:id/capitulo/:orden", async (req, res) => {
  const { id, orden } = req.params;
  console.log("ID recibido:", id, "ORDEN recibido:", orden);
  const query = `
    SELECT c.ID, c.TITULO, c.TEXTO, c.ORDEN, u.NICK AS autor
    FROM capitulo c
    JOIN componeCapLib cl ON c.ID = cl.ID_CAPITULO
    JOIN publica p ON p.ID_LIBRO = cl.ID_LIBRO
    JOIN usuario u ON u.ID = p.ID_USUARIO
    WHERE cl.ID_LIBRO = ? AND c.ORDEN = ?
  `;

  connection.query(query, [id, orden], (err, results) => {
    if (err) {
      console.error("Error al obtener capítulo:", err);
      return res.status(500).json({ mensaje: "Error interno del servidor" });
    }

    if (results.length === 0) {
      console.log("capitulo no encontrado");
      return res.status(404).json({ mensaje: "Capítulo no encontrado" });
    }

    const capitulo = results[0];

    console.log(capitulo);
    res.json({
      capitulo: {
        id: capitulo.ID,
        titulo: capitulo.TITULO,
        texto: capitulo.TEXTO,
        orden: capitulo.ORDEN,
      },
      autor: {
        nick: capitulo.autor,
      },
    });
  });
});

// endpoint para contar capítulos de un libro
app.get("/libro/:id/capitulos/count", (req, res) => {
  const { id } = req.params;
  const query = `
    SELECT COUNT(*) AS total
    FROM capitulo c
    INNER JOIN componeCapLib cl ON c.ID = cl.ID_CAPITULO
    WHERE cl.ID_LIBRO = ?
  `;
  connection.query(query, [id], (err, results) => {
    if (err)
      return res.status(500).json({ mensaje: "Error interno del servidor" });
    res.json({ total: results[0].total });
  });
});

// Obtener todos los libros publicados por el usuario logueado
app.get("/loggedInUser-books", verifyToken, (req, res) => {
  const userId = req.user.id;

  const sql = `
SELECT l.ID, l.TITULO, l.PORTADA, l.DESCRIPCION
FROM libro l
INNER JOIN publica p ON l.ID = p.ID_LIBRO
WHERE p.ID_USUARIO = ?
GROUP BY l.ID, l.TITULO, l.PORTADA, l.DESCRIPCION
ORDER BY l.ID DESC
  `;

  conexion.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("Error al obtener los libros del usuario logueado:", err);
      return res.status(500).json({ mensaje: "Error interno del servidor" });
    }
    res.json(results);
  });
});

// Endpoint para listar capítulos de un libro
app.get("/libro/:id/capitulos", verifyToken, (req, res) => {
  const libroId = req.params.id;
  const sql = `
    SELECT c.ID, c.TITULO, c.ORDEN
    FROM capitulo c
    JOIN componeCapLib cl ON c.ID = cl.ID_CAPITULO
    WHERE cl.ID_LIBRO = ?
    ORDER BY c.ORDEN
  `;
  conexion.query(sql, [libroId], (err, results) => {
    if (err) {
      console.error("Error al obtener capítulos:", err);
      return res.status(500).json({ mensaje: "Error interno del servidor" });
    }
    res.json(results);
  });
});

//POST PARA CREAR NUEVA OBRA
app.post('/obra', verifyToken, (req, res) => {
  const userId = req.user.id; // El usuario logueado
  const { TITULO, DESCRIPCION } = req.body;

  // Validación de datos
  if (!TITULO || !DESCRIPCION) {
    return res.status(400).json({ mensaje: "Título y descripción son obligatorios." });
  }

  // Insertar libro
  const sqlLibro = `INSERT INTO libro (TITULO, DESCRIPCION) VALUES (?, ?)`;
  conexion.query(sqlLibro, [TITULO, DESCRIPCION], (err, libroResult) => {
    if (err) {
      console.error("Error al crear libro:", err);
      return res.status(500).json({ mensaje: "Error en la base de datos" });
    }
    const libroId = libroResult.insertId;

    // Asociar libro con usuario 
    const sqlPublica = `INSERT INTO publica (ID_USUARIO, ID_LIBRO) VALUES (?, ?)`;
    conexion.query(sqlPublica, [userId, libroId], (err2) => {
      if (err2) {
        console.error("Error al asociar libro con usuario:", err2);
        return res.status(500).json({ mensaje: "Error en la base de datos (publica)" });
      }

      //devolver el id y mensaje
      res.status(201).json({ id: libroId, mensaje: "Obra creada con éxito" });
    });
  });
});

app.post('/libro/:id/capitulo', (req, res) => {
  const libroId = req.params.id;
  const { TITULO, TEXTO, ORDEN } = req.body;

  if (!TITULO || !TEXTO || !ORDEN) {
    return res.status(400).json({ mensaje: "Todos los campos son obligatorios" });
  }

  // 1. Crear el capítulo
  const sqlCapitulo = `INSERT INTO capitulo (TITULO, TEXTO, ORDEN) VALUES (?, ?, ?)`;
  conexion.query(sqlCapitulo, [TITULO, TEXTO, ORDEN], (err, capResult) => {
    if (err) {
      console.error("Error al crear el capítulo:", err);
      return res.status(500).json({ mensaje: "Error al crear el capítulo" });
    }
    const capituloId = capResult.insertId;

    // 2. Relacionar el capítulo con el libro
    const sqlRelacion = `INSERT INTO componeCapLib (ID_CAPITULO, ID_LIBRO) VALUES (?, ?)`;
    conexion.query(sqlRelacion, [capituloId, libroId], (err2) => {
      if (err2) {
        console.error("Error al asociar capítulo con libro:", err2);
        return res.status(500).json({ mensaje: "Error al asociar el capítulo al libro" });
      }
      res.status(201).json({ id: capituloId, mensaje: "Capítulo guardado correctamente" });
    });
  });
});


app.listen(3000, () => {
  console.log("listening on http://localhost:3000");
});
