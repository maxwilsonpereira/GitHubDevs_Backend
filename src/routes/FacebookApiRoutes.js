// INFOS-MAX: nodejs/src/FacebookApi/_INTRUCTIONS_MAX.txt

const User = require("../models/User");

const { Router } = require("express");
const routes = Router();

require("dotenv/config");
// bcryptjs for password encrypting
// npm install --save bcryptjs
const bcrypt = require("bcryptjs");

// FILE SYSTEM and PATH:
const fs = require("fs");

// ***** DEVELOPMENT *****
// const frontend_URL = "http://localhost:3000";
// const backend_URL = "http://localhost:3333";
// ***** PRODUCTION *****
const frontend_URL = "https://githubdevs.web.app";
const backend_URL = "https://githug-devs-backend.herokuapp.com";
let facebookUserEmail = "";
let facebookUserPassword = "";

// CODE FROM: http://www.passportjs.org/docs/facebook/
// npm install --save passport
// npm install passport-facebook

var passport = require("passport"),
  FacebookStrategy = require("passport-facebook").Strategy;

routes.use(passport.initialize());
// routes.use(passport.session());
passport.serializeUser(function (user, done) {
  done(null, user);
});
passport.deserializeUser(function (user, done) {
  done(null, user);
});

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: `${backend_URL}/auth/facebook/callback`,
      // callbackURL: process.env.BACKEND_URL_CALLBACK,
      profileFields: ["id", "displayName", "name"],
      // profileFields: ['id', 'displayName', 'picture.type(large)', 'photos', 'email', 'birthday', 'friends', 'first_name', 'last_name', 'middle_name', 'gender', 'link']
      // The last one being an array, so use profile.emails[0].value
      // to get the first email address of the user.
    },
    function (accessToken, refreshToken, profile, done) {
      // INFOS RECEIVED BY THE FB-API:
      // console.log("FB PROFILE: ", profile);
      // CREATE USER (SIGN UP) ****************************************
      // MUST ADD "facebookId: String," to your User Model
      User.findOne({ facebookId: profile.id })
        .then((user) => {
          // LOGGIN IN WITH FACEBOOK API:
          if (user) {
            facebookUserEmail = user.email;
            facebookUserPassword = user.passOriginal;
            // console.log("Logging in with Facebook-API!");
            // IF USER WAS ALREADY CREATED WITH FB-API,
            // done() will login and redirect:
            return done(null, user);
          } else {
            // console.log("Creating new user with FB-API!");
            // CREATE NEW USER with infos comming from FB-API,
            // example: profile.name, profile.id, etc.
            // Saving location, or [1, 1] as default:
            const location = {
              type: "Point",
              // coordinates: [longitude, latitude],
              coordinates: [1, 1],
            };

            // WRITING / SAVING INFOS TO A LOCAL FILE (on the backend root folder):
            const date = new Date();
            facebookUserEmail = `facebook_api_email${profile.id}`;
            facebookUserPassword = `facebook_api_password${profile.id}`;

            // GETTING THE IP FROM THE REQUEST:
            // const ip = req.connection.remoteAddress;
            // \r - Carriage Return: return the cursor to the beginning of the same line.
            // \n - Line Feed: New line.
            // \r\n is often used in preference to \n as it displays properly on both unix and Windows.
            fs.writeFileSync(
              __dirname + "/../localRegister.txt",
              "Date: " +
                date +
                "\r\n" +
                // "IP: " +
                // ip +
                // "\r\n" +
                "Email: " +
                facebookUserEmail +
                "\r\n" +
                // PRODUCTION: PASSWORD won't be saved before encrypting:
                "Password: " +
                facebookUserPassword +
                "\r\n" +
                "\r\n",
              // flags: "a" means that NEW data will be added:
              // If doesn't work, try: flags: "a"
              { flag: "a" }
            );

            // CREATING NEW USER:
            // email and password will not be used!
            // It's just for internal reasons:
            bcrypt
              .hash(facebookUserPassword, 12)
              .then((hashedPassword) => {
                return User.create({
                  email: facebookUserEmail,
                  password: hashedPassword,
                  passOriginal: facebookUserPassword,
                  location,
                  facebookId: profile.id,
                  created_at: date,
                })
                  .then((newUser) => {
                    console.log(
                      "User created and logged in with Facebook-API!"
                    );
                    // done() will login and redirect:
                    return done(null, newUser);

                    // // 201: Created
                    // return res.status(201).json({
                    //   message: "User created! Logging in...",
                    //   newUser,
                    // });
                  })
                  .catch((err) => {
                    console.log("ERROR: ", err);
                    return done(err);
                    // return response.status(400).json({
                    //   message: "Invalid coordinates!",
                    // });
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
          return done(err);
        });
    }
  )
);

// FACEBOOK ROUTE FOR AUTHENTICATION:
routes.get("/auth/facebook", passport.authenticate("facebook"));
// CALLBACK FUNCTION, AFTER AUTHENTICATION:
routes.get(
  "/auth/facebook/callback",
  passport.authenticate("facebook", {
    successRedirect: "/successRedirect",
    failureRedirect: "/failureRedirect",
  })
);
// FAILURE AUTHENTICATION:
routes.get("/failureRedirect", (req, res) => {
  return res.redirect(frontend_URL);
});
// SUCCESS AUTHENTICATION:
routes.get("/successRedirect", (req, res) => {
  // Redirecting to frontend to log in with params:
  // DEV MODE: http://localhost:3000
  // PRODUCTION MODE: https://githubdevs.web.app
  // &urlTrash=#_= BECAUSE Facebook Callback appends '#_=_' to Return the URL,
  // to avoid #_= being atached to the passwor, I created the param urlTrash:
  return res.redirect(
    `${frontend_URL}/githubdevs/facebookapilogin?email=${facebookUserEmail}&password=${facebookUserPassword}&urlTrash=123`
  );
});

module.exports = routes;
