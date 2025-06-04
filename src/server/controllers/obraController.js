const conexion = require("../DB/db");

// CAPÍTULOS
//obtener un capitulo de un libro por su orden
exports.obtenerCapituloPorOrden = (req, res) => {
  const { id, orden } = req.params;
  const query = `
    SELECT c.ID, c.TITULO, c.TEXTO, c.ORDEN, u.NICK AS autor
    FROM capitulo c
    JOIN componeCapLib cl ON c.ID = cl.ID_CAPITULO
    JOIN publica p ON p.ID_LIBRO = cl.ID_LIBRO
    JOIN usuario u ON u.ID = p.ID_USUARIO
    WHERE cl.ID_LIBRO = ? AND c.ORDEN = ?
  `;
  conexion.query(query, [id, orden], (err, results) => {
    if (err) return res.status(500).json({ mensaje: "Error interno del servidor" });
    if (results.length === 0) return res.status(404).json({ mensaje: "Capítulo no encontrado" });
    const capitulo = results[0];
    res.json({ capitulo, autor: { nick: capitulo.autor } });
  });
};

exports.obtenerCapituloPorId = (req, res) => {
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
    if (results.length === 0) return res.status(403).json({ mensaje: "No tienes acceso a este capítulo" });
    res.json(results[0]);
  });
};

exports.contarCapitulos = (req, res) => {
  const { id } = req.params;
  const query = `SELECT COUNT(*) AS total FROM capitulo c INNER JOIN componeCapLib cl ON c.ID = cl.ID_CAPITULO WHERE cl.ID_LIBRO = ?`;
  conexion.query(query, [id], (err, results) => {
    if (err) return res.status(500).json({ mensaje: "Error interno del servidor" });
    res.json({ total: results[0].total });
  });
};

exports.listarCapitulosDeLibro = (req, res) => {
  const libroId = req.params.id;
  const sql = `SELECT c.ID, c.TITULO, c.ORDEN FROM capitulo c JOIN componeCapLib cl ON c.ID = cl.ID_CAPITULO WHERE cl.ID_LIBRO = ? ORDER BY c.ORDEN`;
  conexion.query(sql, [libroId], (err, results) => {
    if (err) return res.status(500).json({ mensaje: "Error interno del servidor" });
    res.json(results);
  });
};

// LIBROS / OBRAS
exports.obtenerObraPublicaPorId = (req, res) => {
  const obraId = req.params.id;

  const sql = `
    SELECT 
      l.ID,
      l.TITULO,
      l.DESCRIPCION,
      l.PORTADA,
      u.NICK AS AUTOR
    FROM libro l
    JOIN publica p ON l.ID = p.ID_LIBRO
    JOIN usuario u ON u.ID = p.ID_USUARIO
    WHERE l.ID = ?;
  `;

  conexion.query(sql, [obraId], (err, results) => {
    if (err) {
      console.error("Error SQL:", err);
      return res.status(500).json({ mensaje: "Error interno" });
    }

    if (results.length === 0) {
      return res.status(404).json({ mensaje: "Obra no encontrada" });
    }

    const autores = [...new Set(results.map((r) => r.AUTOR))];
    const esCompartida = autores.length > 1;

    const response = {
      ID: results[0].ID,
      TITULO: results[0].TITULO,
      DESCRIPCION: results[0].DESCRIPCION,
      PORTADA: results[0].PORTADA,
      AUTOR: autores[0],
      esCompartida,
      coautor: esCompartida ? autores[1] : undefined,
    };

    res.json(response);
  });
};

exports.obtenerLibrosUsuario = (req, res) => {
  const userId = req.user.id;
  const sql = `
    SELECT 
      l.ID, l.TITULO, l.PORTADA, l.DESCRIPCION,
      (SELECT COUNT(*) FROM publica p2 WHERE p2.ID_LIBRO = l.ID) > 1 AS esCompartida,
      (
        SELECT u.NICK FROM publica p3 JOIN usuario u ON u.ID = p3.ID_USUARIO
        WHERE p3.ID_LIBRO = l.ID AND p3.ID_USUARIO != ? LIMIT 1
      ) AS coautor
    FROM libro l
    INNER JOIN publica p ON l.ID = p.ID_LIBRO
    WHERE p.ID_USUARIO = ?
    GROUP BY l.ID
    ORDER BY l.ID DESC
  `;
  conexion.query(sql, [userId, userId], (err, results) => {
    if (err) return res.status(500).json({ mensaje: "Error interno del servidor" });
    res.json(results);
  });
};

exports.obtenerObraPorId = (req, res) => {
  const obraId = req.params.id;
  const userId = req.user.id;
  const sql = `
    SELECT l.* FROM libro l
    INNER JOIN publica p ON l.ID = p.ID_LIBRO
    WHERE l.ID = ? AND p.ID_USUARIO = ?
  `;
  conexion.query(sql, [obraId, userId], (err, results) => {
    if (err) return res.status(500).json({ mensaje: "Error interno" });
    if (results.length === 0) return res.status(403).json({ mensaje: "No tienes acceso a esta obra" });
    res.json(results[0]);
  });
};

exports.eliminarObra = (req, res) => {
  const obraId = req.params.id;
  const userId = req.user.id;
  const checkSql = `SELECT p.ID_LIBRO FROM publica p WHERE p.ID_LIBRO = ? AND p.ID_USUARIO = ?`;
  conexion.query(checkSql, [obraId, userId], (err, results) => {
    if (err) return res.status(500).json({ mensaje: "Error interno del servidor" });
    if (results.length === 0) return res.status(403).json({ mensaje: "No tienes permiso para eliminar esta obra" });
    const deletePublicaSql = `DELETE FROM publica WHERE ID_LIBRO = ?`;
    conexion.query(deletePublicaSql, [obraId], (err2) => {
      if (err2) return res.status(500).json({ mensaje: "Error al eliminar relación publica" });
      const deleteObraSql = `DELETE FROM libro WHERE ID = ?`;
      conexion.query(deleteObraSql, [obraId], (err3) => {
        if (err3) return res.status(500).json({ mensaje: "Error al eliminar la obra" });
        res.json({ mensaje: "Obra eliminada con éxito" });
      });
    });
  });
};

exports.crearObra = (req, res) => {
  const userId = req.user.id;
  const { TITULO, DESCRIPCION } = req.body;
  if (!TITULO || !DESCRIPCION) return res.status(400).json({ mensaje: "Título y descripción son obligatorios." });
  const sqlLibro = `INSERT INTO libro (TITULO, DESCRIPCION) VALUES (?, ?)`;
  conexion.query(sqlLibro, [TITULO, DESCRIPCION], (err, libroResult) => {
    if (err) return res.status(500).json({ mensaje: "Error en la base de datos" });
    const libroId = libroResult.insertId;
    const sqlPublica = `INSERT INTO publica (ID_USUARIO, ID_LIBRO) VALUES (?, ?)`;
    conexion.query(sqlPublica, [userId, libroId], (err2) => {
      if (err2) return res.status(500).json({ mensaje: "Error al asociar libro con usuario" });
      res.status(201).json({ id: libroId, mensaje: "Obra creada con éxito" });
    });
  });
};

exports.editarObra = (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const { TITULO, DESCRIPCION } = req.body;
  if (!TITULO || !DESCRIPCION) return res.status(400).json({ mensaje: "Título y descripción son obligatorios." });
  const checkSql = `SELECT * FROM publica WHERE ID_USUARIO = ? AND ID_LIBRO = ?`;
  conexion.query(checkSql, [userId, id], (err, result) => {
    if (err) return res.status(500).json({ mensaje: "Error en la base de datos." });
    if (result.length === 0) return res.status(403).json({ mensaje: "No tienes permiso para editar esta obra." });
    const updateSql = `UPDATE libro SET TITULO = ?, DESCRIPCION = ? WHERE ID = ?`;
    conexion.query(updateSql, [TITULO, DESCRIPCION, id], (err2, result2) => {
      if (err2) return res.status(500).json({ mensaje: "Error al actualizar la obra." });
      if (result2.affectedRows === 0) return res.status(404).json({ mensaje: "Obra no encontrada." });
      res.status(200).json({ mensaje: "Obra actualizada correctamente." });
    });
  });
};

// CAPÍTULOS (crear/actualizar/borrar)
exports.crearCapitulo = (req, res) => {
  const libroId = req.params.id;
  const { TITULO, TEXTO, ORDEN } = req.body;
  const insertSql = `INSERT INTO capitulo (TITULO, TEXTO, ORDEN) VALUES (?, ?, ?)`;
  conexion.query(insertSql, [TITULO, TEXTO, ORDEN || 1], (err, result) => {
    if (err) return res.status(500).json({ mensaje: "Error al crear capítulo" });
    const capituloId = result.insertId;
    const relSql = `INSERT INTO componeCapLib (ID_CAPITULO, ID_LIBRO) VALUES (?, ?)`;
    conexion.query(relSql, [capituloId, libroId], (err2) => {
      if (err2) return res.status(500).json({ mensaje: "Error al relacionar capítulo con libro" });
      res.json({ mensaje: "Capítulo creado", ID: capituloId });
    });
  });
};

exports.actualizarCapitulo = (req, res) => {
  const capituloId = req.params.id;
  const userId = req.user.id;
  const { TITULO, TEXTO, ORDEN } = req.body;
  const checkOwnershipSql = `
    SELECT c.ID FROM capitulo c
    INNER JOIN componeCapLib cl ON c.ID = cl.ID_CAPITULO
    INNER JOIN publica p ON cl.ID_LIBRO = p.ID_LIBRO
    WHERE c.ID = ? AND p.ID_USUARIO = ?
  `;
  conexion.query(checkOwnershipSql, [capituloId, userId], (err, results) => {
    if (err) return res.status(500).json({ mensaje: "Error interno" });
    if (results.length === 0) return res.status(403).json({ mensaje: "No tienes permiso para editar este capítulo" });
    const updateSql = `UPDATE capitulo SET TITULO = ?, TEXTO = ?, ORDEN = ? WHERE ID = ?`;
    conexion.query(updateSql, [TITULO, TEXTO, ORDEN || 1, capituloId], (err2, result) => {
      if (err2) return res.status(500).json({ mensaje: "Error al actualizar capítulo" });
      if (result.affectedRows === 0) return res.status(404).json({ mensaje: "Capítulo no encontrado" });
      res.json({ mensaje: "Capítulo actualizado con éxito" });
    });
  });
};

exports.eliminarCapitulo = (req, res) => {
  const capituloId = req.params.id;
  const userId = req.user.id;
  const checkOwnershipSql = `
    SELECT cl.ID_LIBRO FROM capitulo c
    INNER JOIN componeCapLib cl ON c.ID = cl.ID_CAPITULO
    INNER JOIN publica p ON cl.ID_LIBRO = p.ID_LIBRO
    WHERE c.ID = ? AND p.ID_USUARIO = ?
  `;
  conexion.query(checkOwnershipSql, [capituloId, userId], (err, results) => {
    if (err) return res.status(500).json({ mensaje: "Error interno" });
    if (results.length === 0) return res.status(403).json({ mensaje: "No tienes permiso para eliminar este capítulo" });
    const deleteRelationSql = `DELETE FROM componeCapLib WHERE ID_CAPITULO = ?`;
    conexion.query(deleteRelationSql, [capituloId], (err2) => {
      if (err2) return res.status(500).json({ mensaje: "Error al eliminar la relación con el libro" });
      const deleteCapituloSql = `DELETE FROM capitulo WHERE ID = ?`;
      conexion.query(deleteCapituloSql, [capituloId], (err3) => {
        if (err3) return res.status(500).json({ mensaje: "Error al eliminar el capítulo" });
        res.json({ mensaje: "Capítulo eliminado con éxito" });
      });
    });
  });
};

// BIBLIOTECA
exports.guardarLibro = (req, res) => {
  const userId = req.user.id;
  const { libroId } = req.body;
  const sql = `INSERT IGNORE INTO guarda (ID_USUARIO, ID_LIBRO) VALUES (?, ?)`;
  conexion.query(sql, [userId, libroId], (err, result) => {
    if (err) return res.status(500).json({ message: "Error en el servidor" });
    if (result.affectedRows === 0) return res.status(200).json({ message: "Ya estaba en tu biblioteca" });
    res.status(200).json({ message: "Libro guardado en tu biblioteca" });
  });
};

exports.obtenerBiblioteca = (req, res) => {
  const userId = req.user.id;
  const sql = `
    SELECT 
      l.ID, l.TITULO, l.DESCRIPCION, l.PORTADA,
      (
        SELECT u.NICK FROM publica p2 JOIN usuario u ON u.ID = p2.ID_USUARIO
        WHERE p2.ID_LIBRO = l.ID LIMIT 1
      ) AS AUTOR,
      (
        SELECT u2.NICK FROM publica p3 JOIN usuario u2 ON u2.ID = p3.ID_USUARIO
        WHERE p3.ID_LIBRO = l.ID AND u2.NICK != (
          SELECT u3.NICK FROM publica p4 JOIN usuario u3 ON u3.ID = p4.ID_USUARIO
          WHERE p4.ID_LIBRO = l.ID LIMIT 1
        ) LIMIT 1
      ) AS coautor
    FROM guarda g
    JOIN libro l ON g.ID_LIBRO = l.ID
    WHERE g.ID_USUARIO = ?
    GROUP BY l.ID
  `;
  conexion.query(sql, [userId], (err, results) => {
    if (err) return res.status(500).json({ message: "Error en el servidor" });
    res.status(200).json(results);
  });
};

exports.eliminarLibroBiblioteca = (req, res) => {
  const userId = req.user.id;
  const libroId = +req.params.libroId;
  const sql = `DELETE FROM guarda WHERE ID_USUARIO = ? AND ID_LIBRO = ?`;
  conexion.query(sql, [userId, libroId], (err) => {
    if (err) return res.status(500).json({ message: "Error al eliminar libro" });
    res.status(200).json({ message: "Libro eliminado de biblioteca" });
  });
};

exports.libroYaGuardado = (req, res) => {
  const userId = req.user.id;
  const libroId = +req.params.libroId;
  const sql = `SELECT 1 FROM guarda WHERE ID_USUARIO = ? AND ID_LIBRO = ? LIMIT 1`;
  conexion.query(sql, [userId, libroId], (err, results) => {
    if (err) return res.status(500).json({ message: "Error en el servidor" });
    const yaGuardado = results.length > 0;
    res.status(200).json({ guardado: yaGuardado });
  });
};
