// FRONTEND USE:
// src\pages\AdminPage\index.js

// AUTHENTICATION:
// https://www.udemy.com/course/nodejs-the-complete-guide/learn/lecture/12097912

// This middleware will check if there is a Token
// and if it's a valid Token.
// If NOT, it will return an error.
// If YES, it will go to next() middleware!

// Authorization MUST BE ENABLED on server.js / app.use(...)
// TO USE AUTHENTICATION.

// LOGIN with TOKEN with:
// npm install --save jsonwebtoken
// Check the token at (must enter the secret word): https://jwt.io/
const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  // console.log("ENV TOKEN IS_AUTH: ", process.env.TOKEN_JWT_SECRET);
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    // 401: Unauthorized
    return res.status(401).json({
      message: "User not authorized!",
    });
  }

  // [0] = "Bearer ", [1] = TOKEN:
  const token = authHeader.split(" ")[1];
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, process.env.TOKEN_JWT_SECRET);
  } catch (err) {
    console.log(err.message);
    // 500: Internal server error
    return res.status(500).json({
      message: "User has no authentication token!",
    });
  }
  if (!decodedToken) {
    // 401: Unauthorized
    return res.status(401).json({
      message: "User not authenticated!",
    });
  }
  // VALID TOKEN:
  // userId and email were stored in the token.
  req.userId = decodedToken.userId;
  // console.log("Token is valid!");
  next();
};
// ****** IMPORTANT ******
// FRONTEND: src/pages/developers/index.js
// api
//   .get(`/devs/${idCurUser}`, {
//     headers: {
//       // "Bearer " is a convention of Authentication Token:
//       Authorization: "Bearer " + props.token,
//     },
//   })
//   .then();
