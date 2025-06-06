const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "../public/pfpics");
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const id = req.params.id;
    const ext = path.extname(file.originalname);
    const carpeta = path.join(__dirname, "../public/pfpics");

    // Borrar otros archivos con el mismo ID antes de guardar el nuevo
    fs.readdir(carpeta, (err, files) => {
      if (err) {
        console.warn("No se pudo leer la carpeta de pfpics:", err.message);
      } else {
        files
          .filter((f) => f.startsWith(id + ".") && f !== `${id}${ext}`)
          .forEach((archivo) => {
            fs.unlink(path.join(carpeta, archivo), (err) => {
              if (err) {
                console.warn("Error al eliminar archivo previo:", archivo, err.message);
              }
            });
        });
      }

      // Luego de intentar borrar, se guarda el nuevo
      cb(null, `${id}${ext}`);
    });
  },
});

const upload = multer({ storage });
module.exports = upload;
