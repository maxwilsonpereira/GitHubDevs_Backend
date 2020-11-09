// Dev contains all the USERS (developers)
const Dev = require("../models/Dev");
// const User = require("../models/User");

module.exports = {
  // DELETE DEV BY ID ****************************************
  deleteDevById(req, res) {
    const userId = req.params.userId;
    const devId = req.params.devId;

    Dev.find({
      $and: [
        { user_id: userId },
        { developers: { $elemMatch: { _id: devId } } },
      ],
    })
      .then((developers) => {
        // console.log(developers);
        // IF ARRAY exists, BUT it is empty:
        if (developers.length < 1) {
          // 404: Not Found
          return res.status(404).json({
            message: "Developer not found!",
          });
        } else {
          // The $pull operator removes from an existing ARRAY all instances
          // of a value or values that match a specified condition.
          // DELETE developer._id = devId WHERE iser_id = userId:
          Dev.update(
            { user_id: userId },
            {
              $pull: {
                developers: { _id: devId },
              },
            },
            { multi: true }
          )
            .then((userDevs) => {
              if (!userDevs) {
                // 404: Not Found
                return res.status(404).json({
                  message: "Developer not found!",
                });
              } else {
                return res.status(200).json({
                  message: "Developer deleted!",
                });
              }
            })
            .catch((err) => {
              // 401: Unauthorized
              console.log("Unauthorized request!");
            });
        }
      })
      .catch((err) => {
        // 500: Not Found
        console.log(err.message);
        return res.status(500).json({
          message: "Internal server error!",
        });
      });
  },

  // DELETE ALL DEVS ****************************************
  deleteAllDevs(req, res) {
    const admPassword = req.params.admPassword;
    if (admPassword === "adm.123") {
      Dev.deleteMany()
        .then(() => {
          return res.status(200).json({ message: "All developers deleted!" });
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
