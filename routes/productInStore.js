const express = require("express");
// const passport = require("passport");
const productInStoreController = require("../controllers/productInStoreController");

const router = express.Router();
// const authenticateJWT = passport.authenticate("jwt", { session: false });

router.post("/addProductInStore", 
// authenticateJWT, 
productInStoreController.addProductInStore);

router.get("/checkQuantityProductInStore", 
// authenticateJWT, 
productInStoreController.checkQuantityProductInStore);

module.exports = router;