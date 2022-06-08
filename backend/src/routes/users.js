import express from "express";
import { body } from "express-validator"; //see docs.
import { auth, verifyAdmin } from "../middleware/auth.js";
import {
  getUser,
  loginUser,
  signUpUser,
  uploadImage,
} from "../controller/user.js";

const router = express.Router();

router.post(
  "/signup",
  [
    body("name").isLength({ min: 3 }),
    body("email", "enter valid email").isEmail(),
    body("password", "password must be atleast 5 characters").isLength({
      min: 5,
    }),
  ],
  signUpUser
);
router.post("/login", loginUser);
router.get("/me", auth, getUser);
router.post("/upload/:userId", auth, uploadImage);

export default router;
