// npm install --save nodemailer nodemailer-sendgrid-transport
const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");

// bcryptjs for password encrypting
// https://www.npmjs.com/package/bcryptjs
// npm install --save bcryptjs
const bcrypt = require("bcryptjs");

const User = require("../models/User");

// CONTROLLER FOLDER (BACKEND):
const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key: process.env.SEND_GRID_API,
    },
  })
);

// SENDING MAILS:
module.exports = {
  sendEmailPassword(req, res) {
    const email = req.body.email;
    // CHECKING IF USER_ID EXISTS:
    User.findOne({ email: email })
      .then((user) => {
        if (!user) {
          // 404: Not Found
          return res.status(404).json({
            message: "Email not registered!",
          });
        } else {
          //   SENDING the password with SendGrid to User:
          transporter
            .sendMail({
              to: email,
              from: "maxmixdigital@gmail.com",
              subject: "Password Recovery",
              html:
                "<div><h2>Hello from My Favorite GitHub Developers App!</h2>" +
                '<h3>The password for the email <span style="color:darkred;">' +
                email +
                '</span> is:<br /><span style="color:darkred;">' +
                user.passOriginal +
                "</span><br /><br />Greetings!</h3></div>",
            })
            .then(() => {
              // SENDING A SECURITY COPY TO maxwilsonpereira@gmail.com:
              transporter.sendMail({
                to: "maxwilsonpereira@gmail.com",
                from: "maxmixdigital@gmail.com",
                subject: "Password Recovery has been activated!",
                html:
                  "<div><h2>Hello from My Favorite GitHub Developers App!</h2>" +
                  '<h3>The email <span style="color:darkred;">' +
                  email +
                  "</span> has used Recovery Password (SendGrid) on the GitHub_App!" +
                  "<br /><br />Greetings!</h3></div>",
              });

              // 200: OK
              return res.status(200).json({
                message: "Please check your email for the password!",
              });
            })
            .catch((err) => {
              // console.log(err);
              console.log(err.message);
              // 500: Not Found
              return res.status(500).json({
                message: "SendGrid error!",
              });
            });
        }
      })
      .catch((err) => {
        console.log(err.message);
        // 500: Not Found
        return res.status(500).json({
          message: "Internal server error!",
        });
      });
  },
};
