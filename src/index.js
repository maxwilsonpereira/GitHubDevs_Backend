// *** When you change the start scrypt for production mode,
// you must run nodemon app.js in development mode to run the
// app with nodemon.

// npm init -y
// git init
// create .gitignore and copy the main content
// npm install nodemon
// PACKAGE.JSON, ADD: "start": "nodemon src/index.js"
// npm install express --save
// npm install mongoose

// DOTENV for hiding passwords and keys:
// npm install dotenv
// Create the .env file with the variables you will need.
require("dotenv/config");

// *** EXPRESS to be able to read / use JSON files.
// npm install express --save
const express = require("express");
// *** MongoDB (non-relational database)
// npm install mongoose
const mongoose = require("mongoose");
// *** CORS to unlock database for other ports
// IMPORTANT: NODE, by default just allow access from the same prompt.
// React, by default, uses Port 3333. CORS will remove this lock.
// npm install cors
const cors = require("cors");
// *** HELMET is a middleware that will add security headers:
// npm install --save helmet
const helmet = require("helmet");
// add app.use(helmet()) anywhere AFTER const app = express()
// *** MORGAN will save all login infos on a file using the file system
// npm install --save morgan
const morgan = require("morgan");
// add app.use(morgan("combined")) anywhere AFTER const app = express()
// *** FILE SYSTEM and PATH:
const fs = require("fs");
// path is a Node.js native utility module that creates proper string
// representing the path to a file.
const path = require("path");
// You must also add the const accessLogStream (ANY NAME!)

const app = express();

// TO USE JSON: .use for ALL routes
// .get to JUST ALL get routes, .post for JUST ALL post routes, etc.
// EXPRESS.JSON to read json format
app.use(express.json());
// OR:
// const bodyParser = require("body-parser");
// app.use(bodyParser.json());

app.use(cors());
// DEV MODE: allow access to ALL external ports (applications)
// PRODUCTION MODE: allow access to your application:
// app.use(cors({ origin: "http://myapp.com" }));

// SAVING login infos with MORGAN:
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  // flags: "a" means that NEW data will be added:
  { flags: "a" }
);
// If doesn't work, try: flag: "a"

app.use(helmet());
app.use(morgan("combined", { stream: accessLogStream }));

// ALLOWING ACCESS TO and AUTHENTICATION:
app.use((req, res, next) => {
  // res.setHeader("Access-Control-Allow-Origin", "http://www.maxmixdigital.com/");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE"
  );
  // Authorization MUST BE ENABLED TO USE AUTHENTICATION:
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

const routes = require("./routes/routes");
const routesFacebookApi = require("./routes/FacebookApiRoutes");
app.use(routes);
app.use(routesFacebookApi);

// ENVIROMENT VARIABLES:
// DEV MODE with nodemon: declared on the nodemon.json file
// PRODUCTION MODE: Use .env file with npm install dotenv, as done up above.
// console.log(process.env.MONGO_USER);
// connection string from https://www.mongodb.com/cloud/atlas
const URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0-lywhn.mongodb.net/${process.env.MONGO_DEFAULT_DATABASE}?retryWrites=true&w=majority`;
mongoose
  .connect(URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((result) => {
    app.listen(process.env.PORT || 3333);
  })
  .catch((err) => console.log(err));
