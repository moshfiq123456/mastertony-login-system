import jwt from "jsonwebtoken";

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization");

    if (!token) {
      return res
        .status(403)
        .json({ error: true, message: "Access Denied: No token provided" });
    }

    // Check for "Bearer " prefix and extract the token
    const tokenParts = token.split(" ");
    if (tokenParts.length !== 2 || tokenParts[0] !== "Bearer") {
      return res
        .status(403)
        .json({ error: true, message: "Access Denied: Invalid token format" });
    }
    console.log(tokenParts[1], "tony", process.env.ACCESS_TOKEN_PRIVATE_KEY);
    const tokenDetails = jwt.verify(
      tokenParts[1],
      process.env.ACCESS_TOKEN_PRIVATE_KEY
    );
    req.user = tokenDetails;
    next();
  } catch (err) {
    console.error("JWT Verification Error:", err);

    if (err.name === "JsonWebTokenError") {
      return res
        .status(403)
        .json({ error: true, message: "Access Denied: Invalid token" });
    }

    // Handle other errors (e.g., TokenExpiredError)
    res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

export default auth;
