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
    methods: "GET,POST, PUT, DELETE", // Métodos permitidos
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

//OBTENER DATOS Y OBRAS DE UN USUARIO POR SU NICK
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
  l.PORTADA AS portada,
  SUBSTRING(l.DESCRIPCION, 1, 200) AS excerpt,
  c.TITULO AS capituloTitulo,
  c.ORDEN AS capituloOrden,
  c.FECHA AS date,
  u.ID AS authorId,                                 
  u.NICK AS username,
  u.NOMBRE AS nombre,                              
  u.APELLIDOS AS apellidos                          
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
      portada: row.portada,
      capituloTitulo: row.capituloTitulo,
      capituloOrden: row.capituloOrden,
      date: row.date,
      author: {
        id: row.authorId,
        username: row.username,
        nombre: row.nombre,
        apellidos: row.apellidos,
      },
    }));

    res.json(posts);
  });
});

//endpoint para obtener un capitulo de un libro por su orden
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

//endpoint para obtener capitulo por su id
app.get("/capitulo/:id", verifyToken, (req, res) => {
  const capituloId = req.params.id;
  const userId = req.user.id;

  const sql = `
    SELECT c.* FROM capitulo c
    INNER JOIN componeCapLib cl ON c.ID = cl.ID_CAPITULO
    INNER JOIN publica p ON cl.ID_LIBRO = p.ID_LIBRO
    WHERE c.ID = ? AND p.ID_USUARIO = ?
  `;

  conexion.query(sql, [capituloId, userId], (err, results) => {
    if (err) return res.status(500).json({ mensaje: "Error interno" });
    if (results.length === 0) {
      return res
        .status(403)
        .json({ mensaje: "No tienes acceso a este capítulo" });
    }
    res.json(results[0]);
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

//ENDPOINT PARA SACAR UNA OBRA POR SU ID
app.get("/obra/:id", verifyToken, (req, res) => {
  const obraId = req.params.id;
  const userId = req.user.id;

  const sql = `
    SELECT l.* 
    FROM libro l
    INNER JOIN publica p ON l.ID = p.ID_LIBRO
    WHERE l.ID = ? AND p.ID_USUARIO = ?
  `;

  conexion.query(sql, [obraId, userId], (err, results) => {
    if (err) return res.status(500).json({ mensaje: "Error interno" });
    if (results.length === 0)
      return res.status(403).json({ mensaje: "No tienes acceso a esta obra" });
    res.json(results[0]);
  });
});

// DELETE PARA Borrar una obra
app.delete("/obra/:id", verifyToken, (req, res) => {
  const obraId = req.params.id;
  const userId = req.user.id;

  // 1. Verificar si el usuario es el autor de la obra
  const checkAuthorSql = `
    SELECT p.ID_LIBRO
    FROM publica p
    WHERE p.ID_LIBRO = ? AND p.ID_USUARIO = ?
  `;

  conexion.query(checkAuthorSql, [obraId, userId], (err, results) => {
    if (err) {
      console.error("Error al verificar autoría:", err);
      return res.status(500).json({ mensaje: "Error interno del servidor" });
    }

    if (results.length === 0) {
      return res
        .status(403)
        .json({ mensaje: "No tienes permiso para eliminar esta obra" });
    }

    // 2. Eliminar primero registros relacionados (opcional: para evitar FK errors si los tienes)
    const deletePublicaSql = `DELETE FROM publica WHERE ID_LIBRO = ?`;
    conexion.query(deletePublicaSql, [obraId], (err2) => {
      if (err2) {
        console.error("Error al eliminar relación en publica:", err2);
        return res
          .status(500)
          .json({ mensaje: "Error al eliminar relación publica" });
      }

      // 3. Eliminar la obra
      const deleteObraSql = `DELETE FROM libro WHERE ID = ?`;
      conexion.query(deleteObraSql, [obraId], (err3) => {
        if (err3) {
          console.error("Error al eliminar obra:", err3);
          return res.status(500).json({ mensaje: "Error al eliminar la obra" });
        }

        res.json({ mensaje: "Obra eliminada con éxito" });
      });
    });
  });
});

//POST PARA CREAR NUEVA OBRA
app.post("/obra", verifyToken, (req, res) => {
  const userId = req.user.id; // El usuario logueado
  const { TITULO, DESCRIPCION } = req.body;

  // Validación de datos
  if (!TITULO || !DESCRIPCION) {
    return res
      .status(400)
      .json({ mensaje: "Título y descripción son obligatorios." });
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
        return res
          .status(500)
          .json({ mensaje: "Error en la base de datos (publica)" });
      }

      //devolver el id y mensaje
      res.status(201).json({ id: libroId, mensaje: "Obra creada con éxito" });
    });
  });
});

//POST PARA CREAR NUEVO CAPITULO
app.post("/libro/:id/capitulo", verifyToken, (req, res) => {
  const libroId = req.params.id;
  const { TITULO, TEXTO, ORDEN } = req.body;

  const insertSql = `INSERT INTO capitulo (TITULO, TEXTO, ORDEN) VALUES (?, ?, ?)`;
  conexion.query(insertSql, [TITULO, TEXTO, ORDEN || 1], (err, result) => {
    if (err)
      return res.status(500).json({ mensaje: "Error al crear capítulo" });

    const capituloId = result.insertId;

    // Relación en componeCapLib
    const relSql = `INSERT INTO componeCapLib (ID_CAPITULO, ID_LIBRO) VALUES (?, ?)`;
    conexion.query(relSql, [capituloId, libroId], (err2) => {
      if (err2)
        return res
          .status(500)
          .json({ mensaje: "Error al relacionar capítulo con libro" });
      res.json({ mensaje: "Capítulo creado", ID: capituloId });
    });
  });
});

//PUT PARA ACTUALIZAR CAPITULO YA EXISTENTE
app.put("/capitulo/:id", verifyToken, (req, res) => {
  const capituloId = req.params.id;
  const userId = req.user.id;
  const { TITULO, TEXTO, ORDEN } = req.body;

  // 1. Verificar que el capítulo pertenece a una obra del usuario autenticado
  const checkOwnershipSql = `
    SELECT c.ID FROM capitulo c
    INNER JOIN componeCapLib cl ON c.ID = cl.ID_CAPITULO
    INNER JOIN publica p ON cl.ID_LIBRO = p.ID_LIBRO
    WHERE c.ID = ? AND p.ID_USUARIO = ?
  `;

  conexion.query(checkOwnershipSql, [capituloId, userId], (err, results) => {
    if (err) return res.status(500).json({ mensaje: "Error interno" });
    if (results.length === 0) {
      return res
        .status(403)
        .json({ mensaje: "No tienes permiso para editar este capítulo" });
    }

    // 2. Si es del usuario, permitir actualizar
    const updateSql = `
      UPDATE capitulo
      SET TITULO = ?, TEXTO = ?, ORDEN = ?
      WHERE ID = ?
    `;
    conexion.query(
      updateSql,
      [TITULO, TEXTO, ORDEN || 1, capituloId],
      (err2, result) => {
        if (err2)
          return res
            .status(500)
            .json({ mensaje: "Error al actualizar capítulo" });
        if (result.affectedRows === 0) {
          return res.status(404).json({ mensaje: "Capítulo no encontrado" });
        }
        res.json({ mensaje: "Capítulo actualizado con éxito" });
      }
    );
  });
});

//DELETE PARA BORRAR CAPITULO
app.delete("/capitulo/:id", verifyToken, (req, res) => {
  const capituloId = req.params.id;
  const userId = req.user.id;

  // 1. Verificar si el capítulo pertenece a un libro del usuario autenticado
  const checkOwnershipSql = `
    SELECT cl.ID_LIBRO FROM capitulo c
    INNER JOIN componeCapLib cl ON c.ID = cl.ID_CAPITULO
    INNER JOIN publica p ON cl.ID_LIBRO = p.ID_LIBRO
    WHERE c.ID = ? AND p.ID_USUARIO = ?
  `;

  conexion.query(checkOwnershipSql, [capituloId, userId], (err, results) => {
    if (err) return res.status(500).json({ mensaje: "Error interno" });
    if (results.length === 0) {
      return res
        .status(403)
        .json({ mensaje: "No tienes permiso para eliminar este capítulo" });
    }

    // 2. Eliminar primero de componeCapLib (relación libro-capítulo)
    const deleteRelationSql = `DELETE FROM componeCapLib WHERE ID_CAPITULO = ?`;

    conexion.query(deleteRelationSql, [capituloId], (err2) => {
      if (err2)
        return res
          .status(500)
          .json({ mensaje: "Error al eliminar la relación con el libro" });

      // 3. Luego eliminar el capítulo en sí
      const deleteCapituloSql = `DELETE FROM capitulo WHERE ID = ?`;

      conexion.query(deleteCapituloSql, [capituloId], (err3) => {
        if (err3)
          return res
            .status(500)
            .json({ mensaje: "Error al eliminar el capítulo" });

        res.json({ mensaje: "Capítulo eliminado con éxito" });
      });
    });
  });
});

//PUT PARA EDITAR OBRA
app.put("/obra/:id", verifyToken, (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const { TITULO, DESCRIPCION } = req.body;

  if (!TITULO || !DESCRIPCION) {
    return res
      .status(400)
      .json({ mensaje: "Título y descripción son obligatorios." });
  }

  // Verificar que la obra pertenece al usuario
  const checkSql = `SELECT * FROM publica WHERE ID_USUARIO = ? AND ID_LIBRO = ?`;

  conexion.query(checkSql, [userId, id], (err, result) => {
    if (err) {
      console.error("Error al verificar propiedad de la obra:", err);
      return res.status(500).json({ mensaje: "Error en la base de datos." });
    }

    if (result.length === 0) {
      return res
        .status(403)
        .json({ mensaje: "No tienes permiso para editar esta obra." });
    }

    // El usuario es el autor, proceder a actualizar
    const updateSql = `UPDATE libro SET TITULO = ?, DESCRIPCION = ? WHERE ID = ?`;

    conexion.query(updateSql, [TITULO, DESCRIPCION, id], (err2, result2) => {
      if (err2) {
        console.error("Error al actualizar la obra:", err2);
        return res
          .status(500)
          .json({ mensaje: "Error al actualizar la obra." });
      }

      if (result2.affectedRows === 0) {
        return res.status(404).json({ mensaje: "Obra no encontrada." });
      }

      res.status(200).json({ mensaje: "Obra actualizada correctamente." });
    });
  });
});

//guardar libro en biblioteca
app.post('/biblioteca', verifyToken, (req, res) => {
  const userId = req.user.id;
  const { libroId } = req.body;

  const sql = `INSERT IGNORE INTO guarda (ID_USUARIO, ID_LIBRO) VALUES (?, ?)`;

  conexion.query(sql, [userId, libroId], (err, result) => {
    if (err) {
      console.error('Error al guardar libro:', err);
      return res.status(500).json({ message: 'Error en el servidor' });
    }

    if (result.affectedRows === 0) {
      return res.status(200).json({ message: 'Ya estaba en tu biblioteca' });
    }

    res.status(200).json({ message: 'Libro guardado en tu biblioteca' });
  });
});


app.listen(3000, () => {
  console.log("listening on http://localhost:3000");
});
