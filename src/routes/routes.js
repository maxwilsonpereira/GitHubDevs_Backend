const { Router } = require("express");
const routes = Router();
const isAuth = require("../middlewares/isAuth");

const DevController = require("../controllers/DevController");
const DevDeleteController = require("../controllers/DevDeleteController");
const DevUpdateController = require("../controllers/DevUpdate");
const UsersController = require("../controllers/UsersController");
const UsersDeleteController = require("../controllers/UsersDeleteController");
const EmailsController = require("../controllers/EmailSendGrid");

// const SearchController = require("./controllers/SearchController");

// DEVELOPMENT: http://localhost:3333/

// ********** USER ROUTE
// LOGIN USER:
routes.post("/login", UsersController.loginUser);
// CREATE USER:
routes.post("/users", UsersController.postUser);
// DELETE USER BY ID:
routes.delete("/users/:userId", UsersDeleteController.deleteUserById);

// ********** DEVELOPERS ROUTES:
// GET DEVS: *********************************
routes.get("/devs/:userId", isAuth, DevController.getDevs);
// CREATE DEV:
routes.post("/devs/:userId", DevController.postDev);
// DELETE DEV BY ID:
routes.delete("/devs/:userId/:devId", DevDeleteController.deleteDevById);
// UPDATE DEV:
routes.put("/devs/:userId/:devId", DevUpdateController.updateDev);

// ********** EMAIL SENDING
routes.post("/emails", EmailsController.sendEmailPassword);

// ********** DEVELOPMENT MODE:
// GET ALL USERS:
routes.get("/devmode_get_users/:admPassword", UsersController.getAllUsers);
// DELETE ALL USERS:
routes.delete(
  "/devmode_delete_users/:admPassword",
  UsersDeleteController.deleteAllUsers
);
// DELETE ALL DEVS:
routes.delete(
  "/devmode_delete_devs/:admPassword",
  DevDeleteController.deleteAllDevs
);

// ***** SEARCHING (NOT IMPLEMENTED YET):
// GET SEARCH BY LOCATION RESULTS:
// routes.get("/search", SearchController.index);

module.exports = routes;
