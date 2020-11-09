// UPDATE:
// https://mongoosejs.com/docs/tutorials/findoneandupdate.html

const Dev = require("../models/Dev");
const User = require("../models/User");

module.exports = {
  // UPDATE/PUT DEV ****************************************
  async updateDev(req, response) {
    const userId = req.params.userId;
    const devId = req.params.devId;

    // CHECKING IF USER_ID EXISTS:
    await User.findById(userId)
      .then((user) => {
        if (!user) {
          // 404: Not Found
          return response.status(404).json({
            message: "User not found!",
          });
        } else {
          // Getting infos from body request:
          const { techs, latitude, longitude, about } = req.body;

          // SPLIT to save each field as a element on the new string
          // TRIM to remove any blank space before and on the end of a string
          techsArray = techs.split(",").map((tech) => tech.trim());

          // Saving location, or [1, 1] as default:
          const location = {
            type: "Point",
            // coordinates: [longitude, latitude],
            coordinates:
              longitude.length < 1 || latitude.lenght < 1
                ? [1, 1]
                : [longitude, latitude],
          };

          Dev.updateOne(
            // WHICH ONE TO UPDATE:
            { user_id: userId, "developers._id": devId },
            // WHICH FILDS TO UPDATE:
            {
              $set: {
                "developers.$.techs": techsArray,
                "developers.$.location": location,
                "developers.$.about": about,
              },
            }
          )
            .then((userDevs) => {
              return response.status(200).json({
                message: "Developer updated!",
              });
            })
            .catch((err) => {
              console.log("updateOne error!");
              console.log(err.message);
            });
        }
      })
      .catch((err) => {
        console.log("Internal server error!");
        // 500: Bad request
        console.log(err.message);
        return response.status(500).json({
          message: "Internal server error!",
        });
      });
  },
};
