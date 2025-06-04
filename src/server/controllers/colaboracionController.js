const conexion = require("../DB/db");

// Enviar solicitud de colaboración
exports.enviarSolicitud = (req, res) => {
  const remitenteId = req.user.id;
  const { destinatarioId } = req.body;

  const sql = `INSERT INTO solicitud_colaboracion (ID_REMITENTE, ID_DESTINATARIO) VALUES (?, ?)`;
  conexion.query(sql, [remitenteId, destinatarioId], (err) => {
    if (err) return res.status(500).json({ message: "Error al enviar solicitud" });
    res.status(201).json({ message: "Solicitud enviada correctamente" });
  });
};

// Obtener solicitudes pendientes
exports.obtenerPendientes = (req, res) => {
  const userId = req.user.id;

  const sql = `
    SELECT sc.ID AS solicitudId, u.ID AS autorId, u.NICK AS username, u.NOMBRE, u.APELLIDOS, u.PFP, sc.FECHA
    FROM solicitud_colaboracion sc
    INNER JOIN usuario u ON sc.ID_REMITENTE = u.ID
    WHERE sc.ID_DESTINATARIO = ? AND sc.ESTADO = 'pendiente'
    ORDER BY sc.FECHA DESC
  `;

  conexion.query(sql, [userId], (err, results) => {
    if (err) return res.status(500).json({ message: "Error al obtener solicitudes" });

    const posts = results.map((row) => ({
      solicitudId: row.solicitudId,
      title: "Solicitud de colaboración",
      date: row.FECHA,
      portada: "",
      excerpt: `${row.username} quiere crear una obra contigo`,
      isCollabRequest: true,
      author: {
        id: row.autorId,
        username: row.username,
        nombre: row.NOMBRE,
        apellidos: row.APELLIDOS,
        pfp: row.PFP,
      },
    }));

    res.json(posts);
  });
};

// Aceptar solicitud y crear libro colaborativo
exports.aceptarSolicitud = (req, res) => {
  const solicitudId = +req.params.id;
  const userId = req.user.id;

  const getSolicitud = `SELECT ID_REMITENTE, ID_DESTINATARIO FROM solicitud_colaboracion WHERE ID = ? AND ESTADO = 'pendiente'`;

  conexion.query(getSolicitud, [solicitudId], (err, results) => {
    if (err) return res.status(500).json({ message: "Error interno" });
    if (results.length === 0) return res.status(404).json({ message: "Solicitud no válida o ya gestionada" });

    const { ID_REMITENTE, ID_DESTINATARIO } = results[0];
    if (ID_DESTINATARIO !== userId) return res.status(403).json({ message: "No tienes permiso para aceptar esta solicitud" });

    const sqlLibro = `INSERT INTO libro (TITULO, DESCRIPCION) VALUES (?, ?)`;
    conexion.query(sqlLibro, ["Título pendiente", "Descripción pendiente"], (err2, libroResult) => {
      if (err2) return res.status(500).json({ message: "Error al crear libro" });

      const libroId = libroResult.insertId;
      const insertPublica = `INSERT INTO publica (ID_USUARIO, ID_LIBRO) VALUES (?, ?), (?, ?)`;

      conexion.query(insertPublica, [ID_REMITENTE, libroId, ID_DESTINATARIO, libroId], (err3) => {
        if (err3) return res.status(500).json({ message: "Error al vincular autores" });

        const updateEstado = `UPDATE solicitud_colaboracion SET ESTADO = 'aceptada' WHERE ID = ?`;
        conexion.query(updateEstado, [solicitudId], (err4) => {
          if (err4) return res.status(500).json({ message: "Error al actualizar solicitud" });
          res.status(200).json({ libroId });
        });
      });
    });
  });
};

// Rechazar solicitud
exports.rechazarSolicitud = (req, res) => {
  const solicitudId = +req.params.id;
  const sql = `UPDATE solicitud_colaboracion SET ESTADO = 'rechazada' WHERE ID = ?`;

  conexion.query(sql, [solicitudId], (err) => {
    if (err) return res.status(500).json({ message: "Error al rechazar solicitud" });
    res.status(200).json({ message: "Colaboración rechazada" });
  });
};

// Verificar si ya existe una solicitud pendiente
exports.colaboracionExiste = (req, res) => {
  const remitenteId = req.user.id;
  const destinatarioId = +req.params.destinatarioId;

  const sql = `
    SELECT 1 FROM solicitud_colaboracion
    WHERE ID_REMITENTE = ? AND ID_DESTINATARIO = ? AND ESTADO = 'pendiente'
    LIMIT 1
  `;

  conexion.query(sql, [remitenteId, destinatarioId], (err, results) => {
    if (err) return res.status(500).json({ message: "Error interno" });
    res.json({ enviada: results.length > 0 });
  });
};

// Cancelar solicitud
exports.cancelarSolicitud = (req, res) => {
  const remitenteId = req.user.id;
  const destinatarioId = +req.params.destinatarioId;

  const sql = `
    DELETE FROM solicitud_colaboracion
    WHERE ID_REMITENTE = ? AND ID_DESTINATARIO = ? AND ESTADO = 'pendiente'
  `;

  conexion.query(sql, [remitenteId, destinatarioId], (err, result) => {
    if (err) return res.status(500).json({ message: "Error al cancelar solicitud" });
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "No se encontró una solicitud pendiente para cancelar" });

    res.status(200).json({ message: "Solicitud cancelada con éxito" });
  });
};
