const conexion = require("../DB/db");

//endpoint para obtener los posts para el feed
exports.obtenerFeedPosts = (req, res) => {
  const userId = req.user.id;

  const sql = `
    SELECT 
      l.ID AS id,
      l.TITULO AS title,
      l.PORTADA AS portada,
      l.DESCRIPCION AS excerpt,
      c.TITULO AS capituloTitulo,
      c.ORDEN AS capituloOrden,
      c.FECHA AS date,
      u.ID AS authorId,                                 
      u.NICK AS username,
      u.NOMBRE AS nombre,                              
      u.APELLIDOS AS apellidos,
      u.PFP AS pfp                          
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
        pfp: row.pfp,
      },
    }));

    res.json(posts);
  });
};

//sacar obras actualizadas recientemente
exports.obtenerObrasRecientes = (req, res) => {
  const sql = `
    SELECT 
      l.ID, 
      l.TITULO, 
      l.DESCRIPCION, 
      l.PORTADA, 
      (
        SELECT u.NICK
        FROM publica p2
        JOIN usuario u ON u.ID = p2.ID_USUARIO
        WHERE p2.ID_LIBRO = l.ID
        LIMIT 1
      ) AS AUTOR,
      (
        SELECT COUNT(*) FROM publica p3 WHERE p3.ID_LIBRO = l.ID
      ) > 1 AS esCompartida,
      (
        SELECT u2.NICK
        FROM publica p4
        JOIN usuario u2 ON u2.ID = p4.ID_USUARIO
        WHERE p4.ID_LIBRO = l.ID AND u2.NICK != (
          SELECT u3.NICK
          FROM publica p5
          JOIN usuario u3 ON u3.ID = p5.ID_USUARIO
          WHERE p5.ID_LIBRO = l.ID
          LIMIT 1
        )
        LIMIT 1
      ) AS coautor
    FROM libro l
    JOIN componeCapLib ccl ON l.ID = ccl.ID_LIBRO
    JOIN capitulo c ON ccl.ID_CAPITULO = c.ID
    GROUP BY l.ID
    ORDER BY MAX(c.FECHA) DESC
    LIMIT 10
  `;

  conexion.query(sql, (err, results) => {
    if (err) {
      console.error("Error al obtener obras recientes:", err);
      return res.status(500).json({ message: "Error en el servidor" });
    }

    res.status(200).json(results);
  });
};
