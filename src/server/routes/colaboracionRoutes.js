const express = require("express");
const router = express.Router();
const colaboracionController = require("../controllers/colaboracionController");
const verifyToken = require("../middlewares/verifyToken");

router.post("/colaboracion", verifyToken, colaboracionController.enviarSolicitud);
router.get("/colaboraciones-pendientes", verifyToken, colaboracionController.obtenerPendientes);
router.post("/colaboracion/:id/aceptar", verifyToken, colaboracionController.aceptarSolicitud);
router.post("/colaboracion/:id/rechazar", verifyToken, colaboracionController.rechazarSolicitud);
router.get("/colaboracion-existe/:destinatarioId", verifyToken, colaboracionController.colaboracionExiste);
router.delete("/colaboracion/:destinatarioId", verifyToken, colaboracionController.cancelarSolicitud);

module.exports = router;
