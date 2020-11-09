const User = require("../models/User");

module.exports = {
  // DELETE DEV BY ID ****************************************
  deleteUserById(req, res) {
    const userId = req.params.userId;
    User.findById(userId)
      .then((user) => {
        if (!user) {
          // 404: Not found
          return res.status(404).json({ message: "User not found!" });
        }
        return User.findByIdAndDelete(userId);
      })
      .then(() => {
        return res.status(200).json({ message: "User deleted!" });
      })
      .catch((err) => {
        // If the lenght of the seached ID will be different,
        // it will cause this error:
        return res.status(500).json({ message: "Wrong ID format!" });
      });
  },

  // DELETE ALL USERS ****************************************
  deleteAllUsers(req, res) {
    const admPassword = req.params.admPassword;
    if (admPassword === "adm.123") {
      User.deleteMany()
        .then(() => {
          return res.status(200).json({ message: "All users deleted!" });
        })
        .catch((err) => {
          return res.status(500).json({
            message: "Internal Server Error!",
          });
        });
    } else {
      return res.status(500).json({
        message: "Wrong ADM password!",
      });
    }
  },
};
