const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const conexion = require("../DB/db");

// Helpers
function generarAccessToken(user) {
  return jwt.sign(user, process.env.JWT_ACCESS_SECRET, { expiresIn: "15m" });
}
function generarRefreshToken(user) {
  return jwt.sign(user, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });
}

exports.login = async (req, res) => {
  const { username, password } = req.body;
  const sql = "SELECT * FROM usuario WHERE NICK = ?";

  conexion.query(sql, [username], async (err, results) => {
    if (err)
      return res.status(500).json({ error: "Error en la base de datos" });
    if (results.length === 0)
      return res.status(401).json({ message: "Usuario no encontrado" });

    const user = results[0];
    const match = await bcrypt.compare(password, user.PASSWORD);
    if (!match)
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

    const accessToken = generarAccessToken(userData);
    const refreshToken = generarRefreshToken(userData);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ message: "Login exitoso", accessToken });
  });
};

exports.logout = (req, res) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    sameSite: "Lax",
  });
  res.status(200).json({ message: "Sesión cerrada correctamente" });
};

exports.refresh = (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res
      .status(401)
      .json({ message: "No se ha proporcionado refresh token" });
  }

  jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, user) => {
    if (err) return res.status(401).json({ message: "Token inválido" });

    const userData = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      nombre: user.nombre,
      apellidos: user.apellidos,
      pfp: user.pfp,
    };

    const newAccessToken = generarAccessToken(userData);
    return res.json({ accessToken: newAccessToken });
  });
};
