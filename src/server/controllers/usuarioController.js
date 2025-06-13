const bcrypt = require("bcrypt");
const conexion = require("../DB/db");

//comprobar si existe nombre de usuario
exports.usuarioExiste = (req, res) => {
  const nick = req.body.nick;
  const sql = "SELECT * FROM usuario WHERE NICK = ?";
  conexion.query(sql, [nick], (err, result) => {
    if (err)
      return res.status(500).json({ error: "Error en la base de datos" });
    if (result.length > 0) {
      return res.json({ existe: true });
    } else {
      return res.json({ existe: false });
    }
  });
};

//comprobar si el email está registrado
exports.emailExiste = (req, res) => {
  const email = req.body.email;
  const sql = "SELECT * FROM usuario WHERE EMAIL = ?";
  conexion.query(sql, [email], (err, result) => {
    if (err)
      return res.status(500).json({ error: "Error en la base de datos" });
    if (result.length > 0) {
      return res.json({ existe: true });
    } else {
      return res.json({ existe: false });
    }
  });
};

//nuevo usuario
exports.register = async (req, res) => {
  const { email, nick, password, nombre, apellidos } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  const sql = `
    INSERT INTO usuario (EMAIL, NICK, PASSWORD, NOMBRE, APELLIDOS, ROLE)
    VALUES (?, ?, ?, ?, ?, 'user')
  `;

  conexion.query(
    sql,
    [email, nick, hashedPassword, nombre, apellidos],
    (err, result) => {
      if (err)
        return res.status(500).json({ error: "Error al registrar usuario" });

      res.status(201).json({ message: "Usuario registrado correctamente" });
    }
  );
};

//sacar todos los usuarios
exports.obtenerTodos = (req, res) => {
  const sql = "SELECT * FROM usuario";

  conexion.query(sql, (err, results) => {
    if (err) {
      console.error("Error al obtener datos:", err);
      return res.status(500).json({ error: "Error en la base de datos" });
    }

    res.json(results);
  });
};

// Obtener info del usuario logueado desde el token
exports.obtenerInfoLoggeado = (req, res) => {
  res.json({
    id: req.user.id,
    nick: req.user.username,
    role: req.user.role,
    nombre: req.user.nombre,
    apellidos: req.user.apellidos,
    pfp: req.user.pfp,
  });
};

// Obtener perfil público de un usuario y sus obras
exports.obtenerPerfilYObras = (req, res) => {
  const nick = req.params.nick;

  const sqlUsuario =
    "SELECT id, nick, nombre, apellidos, pfp, role FROM usuario WHERE nick = ?";

  conexion.query(sqlUsuario, [nick], (err, usuarioResults) => {
    if (err) {
      console.error("Error al consultar usuario:", err);
      return res.status(500).json({ message: "Error en la base de datos" });
    }

    if (usuarioResults.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const usuario = usuarioResults[0];

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

      res.json({
        id: usuario.id,
        role: usuario.role,
        nick: usuario.nick,
        nombre: usuario.nombre,
        apellidos: usuario.apellidos,
        pfp: usuario.pfp,
        obras: obrasResults,
      });
    });
  });
};

// Verificar si el usuario loggeado sigue a otro
exports.comprobarSeguimiento = (req, res) => {
  const seguidorId = req.user.id;
  const seguidoId = +req.params.seguidoId;

  const sql = `
    SELECT 1 FROM sigue
    WHERE ID_SEGUIDOR = ? AND ID_SEGUIDO = ?
  `;

  conexion.query(sql, [seguidorId, seguidoId], (err, results) => {
    if (err) {
      console.error("Error al verificar seguimiento:", err);
      return res.status(500).json({ message: "Error del servidor" });
    }

    res.status(200).json({ sigue: results.length > 0 });
  });
};

// Alternar seguir/dejar de seguir
exports.toggleSeguimiento = (req, res) => {
  const seguidorId = req.user.id;
  const seguidoId = +req.params.seguidoId;

  const checkSql = `SELECT 1 FROM sigue WHERE ID_SEGUIDOR = ? AND ID_SEGUIDO = ?`;
  conexion.query(checkSql, [seguidorId, seguidoId], (err, results) => {
    if (err) {
      console.error("Error al verificar seguimiento:", err);
      return res.status(500).json({ message: "Error del servidor" });
    }

    if (results.length > 0) {
      // Ya sigue: eliminar
      const deleteSql = `DELETE FROM sigue WHERE ID_SEGUIDOR = ? AND ID_SEGUIDO = ?`;
      conexion.query(deleteSql, [seguidorId, seguidoId], (err2) => {
        if (err2) return res.status(500).json({ message: "Error al dejar de seguir" });
        return res.json({ message: "Dejaste de seguir", sigue: false });
      });
    } else {
      // No sigue: insertar
      const insertSql = `INSERT INTO sigue (ID_SEGUIDOR, ID_SEGUIDO) VALUES (?, ?)`;
      conexion.query(insertSql, [seguidorId, seguidoId], (err2) => {
        if (err2) return res.status(500).json({ message: "Error al seguir" });
        return res.json({ message: "Ahora sigues al usuario", sigue: true });
      });
    }
  });
};

//actualizar perfil de usuario
exports.actualizarUsuario = (req, res) => {
  const { id } = req.params;
  const { nick, nombre, apellidos } = req.body;
  let pfp = req.file ? req.file.filename : req.body.pfp;

  if (!pfp) {
    // Si no se proporciona, obtener la pfp actual de la base de datos
    const sqlGetPfp = 'SELECT PFP FROM usuario WHERE ID = ?';
    conexion.query(sqlGetPfp, [id], (err, results) => {
      if (err) {
        console.error('Error al obtener la imagen de perfil actual:', err);
        return res.status(500).json({ message: 'Error al actualizar el usuario' });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      pfp = results[0].PFP;

      // Ahora sí podemos actualizar
      hacerUpdate(pfp);
    });
  } else {
    hacerUpdate(pfp);
  }

  function hacerUpdate(pfpFinal) {
    const updateSql = `
      UPDATE usuario
      SET NICK = ?, NOMBRE = ?, APELLIDOS = ?, PFP = ?
      WHERE ID = ?
    `;

    conexion.query(updateSql, [nick, nombre, apellidos, pfpFinal, id], (err, result) => {
      if (err) {
        console.error("Error al actualizar el usuario:", err);
        return res.status(500).json({ message: "Error al actualizar el usuario" });
      }

      return res.status(200).json({
        message: "Usuario actualizado correctamente",
        pfp: `/pfpics/${pfpFinal}`,
      });
    });
  }
};

