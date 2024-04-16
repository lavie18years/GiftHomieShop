var express = require('express');
const passport = require("passport");
var router = express.Router();
const userController = require("../controllers/userController");
const authenticateJWT = passport.authenticate("jwt", { session: false });
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
const config = require("../config");

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: config.CLOUDINARY_FOLDER_USER_IMAGE, // Thư mục lưu trữ trên Cloudinary
    allowed_formats: ["jpg", "jpeg", "png"],
  },
});

const upload = multer({ storage: storage });

router.post("/login", userController.postLoginUser);
router.post("/register", upload.single("image"), userController.postAddUser);

module.exports = router;
