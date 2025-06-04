const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/verifyToken");
const feedController = require("../controllers/feedController");

router.get("/posts", verifyToken, feedController.obtenerFeedPosts);
router.get("/obras-recientes", feedController.obtenerObrasRecientes);

module.exports = router;
