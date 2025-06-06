require("dotenv").config(); 


const express = require("express");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");


app.use(
  cors({
    origin: "http://localhost:4200",
    credentials: true, // Permite enviar cookies o credenciales
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const path = require("path");
const fs = require("fs");

// Crear la carpeta 'public/pfpics' si no existe
const UPLOAD_DIR = path.join(__dirname, "public", "pfpics");

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Servir imágenes estáticamente
app.use("/pfpics", express.static(UPLOAD_DIR));


const authRoutes = require("./routes/authRoutes");
app.use(authRoutes);

const usuarioRoutes = require("./routes/usuarioRoutes");
app.use(usuarioRoutes);

const feedRoutes = require("./routes/feedRoutes");
app.use(feedRoutes);

const obraRoutes = require("./routes/obraRoutes");
app.use(obraRoutes);

const colaboracionRoutes = require("./routes/colaboracionRoutes");
app.use(colaboracionRoutes);


app.listen(3000, () => {
  console.log("listening on http://localhost:3000");
});
