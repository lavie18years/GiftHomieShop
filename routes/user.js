var express = require("express");
const passport = require("passport");
var router = express.Router();
const { verifyToken } = require("../authenticate");
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
router.post("/upload", upload.single("image"), userController.uploadImg);
router.post("/login", userController.postLoginUser);
router.post("/register", upload.single("image"), userController.postAddUser);
router.get("/fetchMe", verifyToken, userController.fetchMe);
router.get("/userid/:userid", userController.getUserById);
router.get("/username/:userName", userController.getUserByUsername);
router.get("/role/:role", userController.getUserByRole);
router.put(
  "/update-user/:userId",
  authenticateJWT,
  userController.updateUserByID
);
router.get("/", authenticateJWT, userController.getAllUser);
module.exports = router;
