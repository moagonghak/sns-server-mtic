const { auth } = require("../firebase/firebase-config");
const { StatusCodes } = require('http-status-codes');

const authenticate = async (req, res, next) => {
  try {
    const requestorId = req.header("requestorId");
    const requestorToken = req.header("requestorToken");

    if (!requestorId || !requestorToken) {
      return res.status(StatusCodes.UNAUTHORIZED).send({ message: "Unauthorized" });
    }

    const decodedToken = await auth.verifyIdToken(requestorToken);

    if (decodedToken.uid !== requestorId) {
      return res.status(StatusCodes.UNAUTHORIZED).send({ message: "Unauthorized" });
    }

    next();
  } catch (error) {
    console.log("Error verifying token:", error);
    return res.status(StatusCodes.UNAUTHORIZED).send({ message: "Unauthorized" });
  }
};


module.exports = {
  authenticate,
};