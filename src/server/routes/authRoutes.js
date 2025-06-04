const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// Endpoints
router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.post("/refresh", authController.refresh);

module.exports = router;
