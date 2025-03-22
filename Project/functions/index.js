
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

admin.initializeApp();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: functions.config().gmail.email,
    pass: functions.config().gmail.password,
  },
});

exports.sendWelcomeEmailOnCreate = functions.firestore
  .onDocumentCreated("users/{userId}", async (event) => {
    try {
      const user = event.data.data();

      // Check if email exists
      if (!user || !user.email) {
        console.error("No valid user data or email found");
        return null;
      }

      const name = user.personal && user.personal.name ? user.personal.name : "User";

      const mailOptions = {
        from: "LabGear <labgear@gmail.com>",
        to: user.email,
        subject: "Welcome to LabGear",
        text: `Greetings ${name},

Your account has been successfully created for LabGear app, CVR College Of Engineering.

You can log in using your email: ${user.email}

If you need to reset your password, please use the "Forgot Password" 
option on the login screen.

For further queries contact: labgear@gmail.com

Thank you`,
      };

      const result = await transporter.sendMail(mailOptions);
      console.log("Email sent successfully", result);
      return result;
    } catch (error) {
      console.error("Error sending email:", error);
      throw new functions.https.HttpsError(
        "internal", "Error sending welcome email: " + error.message);
    }
  });
