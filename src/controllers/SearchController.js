const Dev = require("../models/Dev");
const parseStringAsArray = require("../utils/parseStringAsArray");

module.exports = {
  async index(request, response) {
    const { latitude, longitude, techs } = request.query;
    const techsArray = parseStringAsArray(techs);
    // FIND() returns all occurrences:
    const devs = await Dev.find({
      techs: {
        // IN: MongoDB Operator that will match the techs inside all the DB with the techs
        // received on the requested const { latutude, longitude, TECHS }
        // MongoDB Operators:
        // https://docs.mongodb.com/manual/reference/operator/
        $in: techsArray,
      },
      location: {
        // NEAR: MongoDB Operator used to find objects NEAR a given location
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [longitude, latitude],
          },
          $maxDistance: 10000, // 10 km
        },
      },
    });
    return response.json({ devs });
  },

  async update() {
    // UPDATE name, avatar_url, bio, location, techs
  },
};
