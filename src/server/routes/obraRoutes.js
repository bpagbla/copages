const express = require("express");
const router = express.Router();
const obraController = require("../controllers/obraController");
const verifyToken = require("../middlewares/verifyToken");

// OBRAS / LIBROS
router.get("/loggedInUser-books", verifyToken, obraController.obtenerLibrosUsuario);
router.get("/obra/:id", verifyToken, obraController.obtenerObraPorId);
router.post("/obra", verifyToken, obraController.crearObra);
router.put("/obra/:id", verifyToken, obraController.editarObra);
router.delete("/obra/:id", verifyToken, obraController.eliminarObra);
router.get("/obra-publica/:id", obraController.obtenerObraPublicaPorId);

// CAPÍTULOS
router.get("/libro/:id/capitulo/:orden", obraController.obtenerCapituloPorOrden);
router.get("/capitulo/:id", verifyToken, obraController.obtenerCapituloPorId);
router.get("/libro/:id/capitulos", obraController.listarCapitulosDeLibro);
router.get("/libro/:id/capitulos/count", obraController.contarCapitulos);
router.post("/libro/:id/capitulo", verifyToken, obraController.crearCapitulo);
router.put("/capitulo/:id", verifyToken, obraController.actualizarCapitulo);
router.delete("/capitulo/:id", verifyToken, obraController.eliminarCapitulo);

// BIBLIOTECA
router.post("/biblioteca", verifyToken, obraController.guardarLibro);
router.get("/biblioteca", verifyToken, obraController.obtenerBiblioteca);
router.delete("/biblioteca/:libroId", verifyToken, obraController.eliminarLibroBiblioteca);
router.get("/biblioteca/:libroId", verifyToken, obraController.libroYaGuardado);

module.exports = router;
