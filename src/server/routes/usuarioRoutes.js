const express = require("express");
const router = express.Router();
const usuarioController = require("../controllers/usuarioController");
const verifyToken = require("../middlewares/verifyToken");
const upload = require("../middlewares/uploadPfp");


router.post("/usuarioExiste", usuarioController.usuarioExiste);
router.post("/emailExiste", usuarioController.emailExiste);
router.post("/register", usuarioController.register);
router.get("/usuarios", usuarioController.obtenerTodos);
router.get("/user-info", verifyToken, usuarioController.obtenerInfoLoggeado);
router.get("/profile/:nick", usuarioController.obtenerPerfilYObras);
router.get("/sigue/:seguidoId", verifyToken, usuarioController.comprobarSeguimiento);
router.post("/sigue/:seguidoId", verifyToken, usuarioController.toggleSeguimiento);
router.put("/user/:id", upload.single("pfp"), verifyToken, usuarioController.actualizarUsuario);



module.exports = router;
