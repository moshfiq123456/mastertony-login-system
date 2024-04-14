import { Router } from "express";
import UserToken from "../models/UserToken.js";
import jwt from "jsonwebtoken";
import verifyRefreshToken from "../utils/verifyRefreshToken.js";
import { refreshTokenBodyValidation } from "../utils/validationSchema.js";
import logger from '../logger.js';

const router = Router();

// get new access token


// get new access token
router.post("/", async (req, res) => {
  try {
    const { error } = refreshTokenBodyValidation(req.body);
    if (error) {
      const errorMessage = `Validation error in token refresh: ${error.details[0].message}`;
      logger.error(errorMessage);
      return res.status(400).json({ error: true, message: error.details[0].message });
    }

    verifyRefreshToken(req.body.refreshToken)
      .then(({ tokenDetails }) => {
        const payload = { _id: tokenDetails._id, roles: tokenDetails.roles };
        const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_PRIVATE_KEY, { expiresIn: "1d" });
        logger.info('New access token generated successfully');
        res.status(200).json({
          error: false,
          accessToken,
          message: "Access token created successfully",
        });
      })
      .catch((err) => {
        const errorMessage = `Error in token refresh: ${err}`;
        logger.error(errorMessage);
        res.status(400).json(err);
      });
  } catch (err) {
    const errorMessage = `Error in token refresh: ${err}`;
    logger.error(errorMessage);
    console.log(err);
    res.status(500).json({ error: true, message: "Internal Server Error" });
  }
});

// logout
router.delete("/", async (req, res) => {
  try {
    const { error } = refreshTokenBodyValidation(req.body);
    if (error) {
      const errorMessage = `Validation error in token logout: ${error.details[0].message}`;
      logger.error(errorMessage);
      return res.status(400).json({ error: true, message: error.details[0].message });
    }

    const userToken = await UserToken.findOne({ token: req.body.refreshToken });
    if (!userToken) {
      logger.info('User already logged out');
      return res.status(200).json({ error: false, message: "Logged Out Successfully" });
    }

    await userToken.remove();
    logger.info('User logged out successfully');
    res.status(200).json({ error: false, message: "Logged Out Successfully" });
  } catch (err) {
    const errorMessage = `Error in token logout: ${err}`;
    logger.error(errorMessage);
    console.log(err);
    res.status(500).json({ error: true, message: "Internal Server Error" });
  }
});

export default router;
