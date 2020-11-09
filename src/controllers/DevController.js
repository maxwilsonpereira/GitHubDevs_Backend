// IMPORTANT: A DEV will JUST be created IF and ONLY IF
// the user exists on GitHUB!

// ***** VERY IMPORTANT ****************************************
// WILL ANY RESPONSE.STATUS(4xx OR 5xx) be received
// on the FRONTEND as an ERROR????
// To access its content: setErrorMessage(err.response.data.message);
// EXAMPLE: file frontend/DevForm/index.js

// AXIOS library is used to allow the communication between APIs
const axios = require("axios");
const Dev = require("../models/Dev");
const User = require("../models/User");

module.exports = {
  // ASYNC / AWAIT because the communication with the API can take time
  // the app will wait for the communication to end before continues

  // GET ALL DEVS FROM CURRENT USER****************************************
  async getDevs(req, res) {
    const userId = req.params.userId;
    // CHECKING IF USER_ID EXISTS:
    User.findById(userId)
      .then((user) => {
        if (!user) {
          // 404: Not Found
          return res.status(404).json({
            message: "User not found!",
          });
        } else {
          Dev.findOne({ user_id: userId })
            .then((userDevs) => {
              if (!userDevs) {
                // FRONTEND, userDevs will be null:
                return res.json(userDevs);
              } else {
                // FRONTEND: userDevs = all developers:
                return res.status(200).json(userDevs.developers);
              }
            })
            .catch((err) => {
              console.log(err.message);
              // 500: Internal server error
              return res.status(500).json({
                message: "Internal server error!",
              });
            });
        }
      })
      .catch((err) => {
        // 404: Not Found
        console.log("User not found!");
        return res.status(404).json({
          message: "User not found!",
        });
      });
  },

  // CREATE/POST DEV ****************************************
  async postDev(request, response) {
    const userId = request.params.userId;
    // CHECKING IF USER_ID EXISTS:
    await User.findById(userId)
      .then((user) => {
        if (!user) {
          // 404: Not Found
          return response.status(404).json({
            message: "User not found!",
          });
        } else {
          // POST: Getting infos from URL body request:
          const { techs, latitude, longitude, about } = request.body;
          const githubUsername = request.body.github_username;

          // CHECKING if this user has any developer saved:
          Dev.findOne({ user_id: userId })
            .then((userDevs) => {
              // Checking if user exists on GitHub:
              return axios
                .get(`https://api.github.com/users/${githubUsername}`)
                .then((apiResponse) => {
                  // Case user has no name in GitHUB, get the login:
                  const { name = login, avatar_url, bio } = apiResponse.data;
                  // Same result using let and if:
                  // let { name, avatar_url, bio } = apiResponse.data;
                  // if (!name) { name = apiResponse.data.login; }

                  // SPLIT to save each field as a element on the new string
                  // TRIM to remove any blank space before and on the end of a string
                  const techsArray = techs
                    .split(",")
                    .map((tech) => tech.trim());

                  // Saving location, or [1, 1] as default:
                  const location = {
                    type: "Point",
                    // coordinates: [longitude, latitude],
                    coordinates:
                      longitude.length < 1 || latitude.lenght < 1
                        ? [1, 1]
                        : [longitude, latitude],
                  };

                  const devToSave = {
                    name,
                    github_username: githubUsername,
                    avatar_url,
                    bio,
                    techs: techsArray,
                    location,
                    about,
                  };
                  // CASE this will be the first developer to save:
                  if (!userDevs) {
                    // Saving API response to DevSchema on src/model/Dev.js:
                    Dev.create({
                      user_id: userId,
                      developers: [devToSave],
                    })
                      .then((newUser) => {
                        // 201: Created
                        return response
                          .status(201)
                          .json({ message: "Developer saved!", newUser });
                      })
                      .catch((err) => {
                        // 400: Bad request
                        return response.status(400).json({
                          message: "Invalid coordinates!",
                        });
                      });
                  } else {
                    // CHECKING IF DEV ALREADY SAVED for current user:
                    Dev.find({
                      $and: [
                        { user_id: userId },
                        {
                          developers: {
                            $elemMatch: { github_username: githubUsername },
                          },
                        },
                      ],
                    }).then((devs) => {
                      // console.log(devs);
                      // IF devs.length > 0, dev is already saved:
                      if (devs.length > 0) {
                        // 403: Forbidden
                        return response
                          .status(403)
                          .json({ message: "Developer already registered!" });
                      } else {
                        Dev.update(
                          // WHICH ONE TO UPDATE:
                          { user_id: userId },
                          // WHICH FILDS TO UPDATE:
                          {
                            $push: {
                              developers: {
                                $each: [devToSave],
                              },
                            },
                          }
                        )
                          .then((res) => {
                            // 200: OK
                            return response.status(200).json({
                              message: "Developer saved!",
                            });
                          })
                          .catch((err) => {
                            console.log(err.message);
                          });
                      }
                    });
                  }
                })
                .catch((err) => {
                  if (err.response.status === 403) {
                    // 403: Forbidden
                    return response.status(404).json({
                      message: "API rate limit exceeded! Try in one hour!",
                    });
                  } else {
                    // 404: Not Found
                    return response.status(404).json({
                      message: "GitHub username not found!",
                      // message: "Username not found or Maximum requests!",
                    });
                  }
                });
            })
            .catch((err) => {
              console.log(err.message);
              // 500: Internal server error
              return response.status(500).json({
                message: "Internal server error!",
              });
            });
        }
      })
      .catch((err) => {
        console.log("Wrong user ID format!");
        // 400: Bad request
        return response.status(400).json({
          message: "Wrong user ID format!",
        });
      });
  },
};
