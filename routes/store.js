const express = require("express");
const passport = require("passport");
const storeController = require("../controllers/storeController");
const router = express.Router();
const authenticateJWT = passport.authenticate("jwt", { session: false });

const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const config = require("../config"); // Import file chứa thông tin cấu hình

router.get("/", storeController.getAllStore);
router.post("/", storeController.addStore);
router.get("/search", storeController.getStoreByLocation);
router.get("/:storeId", storeController.getStoreByID);
router.put("/:storeId", storeController.updateStoreByID);
router.delete("/:storeId", storeController.deleteStoreByID);

module.exports = router;
