import express from "express";
import { registerUser, getAllUsers } from "../controllers/userController.js";
import { upload } from "../middlewares/multer.js";

const router = express.Router();

// router.post('/register', registerUser);
router.post(
  "/register",
  (req, res, next) => {
    req.on("data", (chunk) => {
      console.log("Chunk Length:", chunk.length);
    });
    next();
  },
  upload.array("images"),
  registerUser
);
router.get("/", getAllUsers);

export default router;
