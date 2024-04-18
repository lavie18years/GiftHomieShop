const express = require("express");
// const passport = require("passport");
const orderController = require("../controllers/orderController");

const router = express.Router();
// const authenticateJWT = passport.authenticate("jwt", { session: false });

router.post("/createOrder", 
// authenticateJWT, 
orderController.createOrder);

// router.get("/responseSucessPayPal", 
// // authenticateJWT, 
// orderController.responseSucessPayPal);

// router.get("/responseCancelPayPal", 
// // authenticateJWT, 
// orderController.responseCancelPayPal);

module.exports = router;