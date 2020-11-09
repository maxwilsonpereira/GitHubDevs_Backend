// *** MORE INFOS ON DevController.js file!

// bcryptjs for password encrypting
// npm install --save bcryptjs
const bcrypt = require("bcryptjs");

// LOGIN WITH TOKEN:
// npm install --save jsonwebtoken
// Check the token at (must enter the secret word): https://jwt.io/
// Authorization MUST BE ENABLED on server.js / app.use(...)
// TO USE AUTHENTICATION.
const jwt = require("jsonwebtoken");

// FILE SYSTEM and PATH:
const fs = require("fs");
// const path = require("path");

// const axios = require("axios");

const User = require("../models/User");

module.exports = {
  // GET ALL USERS ****************************************
  async getAllUsers(req, res) {
    const admPassword = req.params.admPassword;
    if (admPassword === "adm.123") {
      await User.find().then((users) => {
        // console.log(users);
        if (users === undefined || users.length == 0) {
          // 200: OK
          return res.status(200).json({ message: "No user available!" });
        }
        return res.status(200).json({ message: "Users fetched!", users });
      });
    } else {
      return res.status(500).json({
        message: "Wrong ADM password!",
      });
    }
  },

  // CREATE USER (SIGN UP) ****************************************
  async postUser(req, res) {
    const { email, password, latitude, longitude } = req.body;
    // CHECKING if user already registered:
    User.findOne({ email })
      .then((user) => {
        if (user) {
          return (
            // 409: Conflict
            res.status(409).json({ message: "Email already registered!" })
          );
        } else if (email.length > 40 || password.length > 40) {
          // 400: Bad request
          return res
            .status(400)
            .json({ message: "Maximum 40 characters per field!" });
        } else {
          // Saving location, or [1, 1] as default:
          const location = {
            type: "Point",
            // coordinates: [longitude, latitude],
            coordinates:
              longitude.length < 1 || latitude.lenght < 1
                ? [1, 1]
                : [longitude, latitude],
          };

          // WRITING / SAVING INFOS TO A LOCAL FILE (on the backend root folder):
          const date = new Date();
          // GETTING THE IP FROM THE REQUEST:
          const ip = req.connection.remoteAddress;
          // \r - Carriage Return: return the cursor to the beginning of the same line.
          // \n - Line Feed: New line.
          // \r\n is often used in preference to \n as it displays properly on both unix and Windows.
          fs.writeFileSync(
            __dirname + "/../localRegister.txt",
            "Date: " +
              date +
              "\r\n" +
              "IP: " +
              ip +
              "\r\n" +
              "Email: " +
              email +
              "\r\n" +
              // PRODUCTION: PASSWORD won't be saved before encrypting:
              "Password: " +
              password +
              "\r\n" +
              "\r\n",
            // flags: "a" means that NEW data will be added:
            // If doesn't work, try: flags: "a"
            { flag: "a" }
          );
          // CREATING NEW USER:
          bcrypt
            .hash(password, 12)
            .then((hashedPassword) => {
              return User.create({
                email,
                password: hashedPassword,
                passOriginal: password,
                location,
                created_at: date,
              })
                .then((newUser) => {
                  // 201: Created
                  return res
                    .status(201)
                    .json({ message: "User created! Logging in...", newUser });
                })
                .catch((err) => {
                  return response.status(400).json({
                    message: "Invalid coordinates!",
                  });
                });
            })
            .catch((err) => {
              return res.status(400).json({
                message: "Bcrypt problem!",
              });
            });
        }
      })
      .catch((err) => {
        console.log(err);
        return res.status(500).json({
          message: "Internal server error! (MAX 50 REQ?)",
        });
      });
  },

  // LOGIN User ****************************************
  // TOKEN will be created here.
  loginUser(req, res, next) {
    // console.log("ENV TOKEN USER_CONTROLLER: ", process.env.TOKEN_JWT_SECRET);
    const { email, password } = req.body;
    let loadedUser;
    // FIND ONE by email (LOGIN):
    User.findOne({ email: email }).then((user) => {
      if (!user) {
        console.log("Email not registered!");
        // 404: NOT FOUND
        return res.status(404).json({ message: "Email not registered!" });
      } else {
        loadedUser = user;
        return (
          bcrypt
            .compare(password, user.password)
            // isEqual (TRUE or FALSE):
            .then((isEqual) => {
              if (!isEqual) {
                // 401: Unauthorized
                return res.status(401).json({ message: "Wrong password!" });
              }
              // LOGIN WITHOUT TOKEN:
              // return res.status(200).json({
              //   name: loadedUser.name,
              //   email: loadedUser.email,
              //   id: loadedUser._id,
              // });

              // LOGIN WITH TOKEN:
              // npm install --save jsonwebtoken
              const token = jwt.sign(
                {
                  // email: loadedUser.email,
                  userId: loadedUser._id.toString(),
                },
                // Secret word at .env and nodemon.json:
                process.env.TOKEN_JWT_SECRET,
                // Expire date/time:
                { expiresIn: "120h" }
              );
              return res.status(200).json({
                token: token,
                id: loadedUser._id.toString(),
                email: loadedUser.email,
              });
            })
            .catch((err) => {
              console.log(err.message);
              return res
                .status(500)
                .json({ message: "Internal server error!" });
            })
        );
      }
    });
  },
};
