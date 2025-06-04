const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(" ")[1]; // Extrae el token tras "Bearer"

  if (!token) return res.status(403).json({ message: "Token requerido" });

  jwt.verify(token, process.env.JWT_ACCESS_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Token inválido" });

    req.user = decoded; // Guarda los datos del token en la request
    next();
  });
}

module.exports = verifyToken
