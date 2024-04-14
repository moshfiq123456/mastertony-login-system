import { Router } from "express";
import User from "../models/User.js";
import bcrypt from "bcrypt";
import generateTokens from "../utils/generateTokens.js";
import {
  signUpBodyValidation,
  logInBodyValidation,
} from "../utils/validationSchema.js";

import logger from '../logger.js';
const router = Router();

router.get("/health",async(req,res)=>{
 res.status(200).json({
  message:"I am fucked"
 })
})
// signup
router.post("/signUp", async (req, res) => {
  try {
    const { error } = signUpBodyValidation(req.body);
    if (error) {
      logger.error({ message: error.details[0].message, timestamp: new Date().toISOString() });
      return res.status(400).json({ error: true, message: error.details[0].message });
    }

    const user = await User.findOne({ email: req.body.email });
    if (user) {
      logger.error({ message: "User with given email already exists", email: req.body.email, timestamp: new Date().toISOString() });
      return res.status(400).json({ error: true, message: "User with given email already exists" });
    }

    const salt = await bcrypt.genSalt(Number(process.env.SALT));
    const hashPassword = await bcrypt.hash(req.body.password, salt);

    await new User({ ...req.body, password: hashPassword }).save();

    logger.info({ message: "Account created successfully", email: req.body.email, timestamp: new Date().toISOString() });
    res.status(201).json({ error: false, message: "Account created successfully" });
  } catch (err) {
    logger.error({ message: err.message, timestamp: new Date().toISOString() });
    console.log(err);
    res.status(500).json({ error: true, message: "Internal Server Error" });
  }
});

// login
router.post("/logIn", async (req, res) => {
  try {
    const { error } = logInBodyValidation(req.body);
    if (error) {
      logger.error({ message: error.details[0].message, timestamp: new Date().toISOString() });
      return res.status(400).json({ error: true, message: error.details[0].message });
    }

    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      logger.error({ message: "User not found", email: req.body.email, timestamp: new Date().toISOString() });
      return res.status(401).json({ error: true, message: "Invalid email or password" });
    }

    const verifiedPassword = await bcrypt.compare(req.body.password, user.password);
    if (!verifiedPassword) {
      logger.error({ message: "Incorrect password", email: req.body.email, timestamp: new Date().toISOString() });
      return res.status(401).json({ error: true, message: "Invalid email or password" });
    }

    const { accessToken, refreshToken } = await generateTokens(user);

    logger.info({ message: "Logged in successfully", email: req.body.email, timestamp: new Date().toISOString() });
    res.status(200).json({
      error: false,
      accessToken,
      refreshToken,
      message: "Logged in successfully",
    });
  } catch (err) {
    logger.error({ message: err.message, timestamp: new Date().toISOString() });
    console.log(err);
    res.status(500).json({ error: true, message: "Internal Server Error" });
  }
});

export default router;
