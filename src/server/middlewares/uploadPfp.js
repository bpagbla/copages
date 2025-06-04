const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "../public/pfpics");
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const nick = req.body.nick || "unknown";
    const ext = path.extname(file.originalname);
    cb(null, `${nick}${ext}`);
  },
});

const upload = multer({ storage });
module.exports = upload;
