const Owner = require("../models/owner-model");
const Renter = require("../models/renter-model");
const jwt = require('jsonwebtoken');
const bcrypt = require("bcryptjs");
const nodemailer = require('nodemailer');

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  const renterExist = await Renter.findOne({ email });
  const ownerExist = await Owner.findOne({ email });

  if (!renterExist && !ownerExist) {
    res.status(400).json({ message: "Invalid Credentials .. " });
  }

  let userExist;
  if (renterExist) {
    userExist = renterExist;
  } else if (ownerExist) {
    userExist = ownerExist
  } else {
    res.status(403).json({ message: "Invalid email " });
    return;
  }
  // console.log(userExist);
  if (userExist) {
    const token = jwt.sign({ id: userExist._id }, "RENTALWEBSITE", { expiresIn: "1d" });
    // console.log(token);
    var transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: 'renteasy312@gmail.com',
        pass: 'sney zhwc gqwo rmvz'
      }
    });
    // console.log(transporter);

    const mailOptions = {
      from: 'padmaniarpit195@gmail.com',
      // to: 'jaygundaraniya074@gmail.com',
      to: userExist.email,
      subject: 'Reset Your Password',
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset</title>
        </head>
        <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
    
          <div style="background-color: #fff; padding: 20px; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h1 style="color: #333; text-align: center;">Reset Your Password</h1>
            <p style="color: #555; text-align: center;">Dear User,</p>
            <p style="color: #555; text-align: center;">We received a request to reset your password for your account associated with the email address <strong>${userExist.email}</strong> on our RentEasy.</p>
            <p style="color: #555; text-align: center;">To proceed with resetting your password, please click the button below:</p>
            
            <div style="text-align: center; margin-top: 20px;">
              <a href="http://localhost:3000/resetPassword/${userExist._id}/${token}" style="background-color: #007bff; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Your Password</a>
            </div>
    
            <p style="color: #555; text-align: center; margin-top: 20px;">If you did not request a password reset or if you believe this email was sent in error, please ignore this message.</p>
            <p style="color: #555; text-align: center;">Thank you,<br>RentEasy Team</p>
          </div>
    
        </body>
        </html>
      `
    };


    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
        res.status(201).json({ message: error });
      } else {
        console.log('Email sent: ' + info.response);
        res.status(201).json({ message: "email sent successfully" });
      }
    });
  }


}

const resetPassword = async (req, res) => {
  const { id, token } = req.params;
  const { password } = req.body;
  console.log(password);

  jwt.verify(token, "RENTALWEBSITE", async (err, decode) => {
    if (err) {
      req.json({ message: "error in reset password" });
    }
    else {
      try {
        const saltRound = await bcrypt.genSalt(10); // Corrected typo
        const hashedPassword = await bcrypt.hash(password, saltRound);

        console.log(hashedPassword);

        const renterExist = await Renter.findById({ _id: id });
        const ownerExist = await Owner.findById({ _id: id });
        console.log(ownerExist);

        if (!renterExist && !ownerExist) {
          return res.status(400).json({ message: "Invalid Credentials in reset password" });
        }


        if (renterExist) {
          await Renter.findByIdAndUpdate(id, { password: hashedPassword });
          console.log("password is reset in renter");
          return res.status(200).json({ message: "Password updated successfully" });
        } else if (ownerExist) {
          await Owner.findByIdAndUpdate(id, { password: hashedPassword });
          return res.status(200).json({ message: "Password updated successfully" });
        } else {
          console.log("not reset errror in else part");
          return res.status(403).json({ message: "User not valid for updating password" });
        }
      } catch (error) {
        console.error("Error in resetPassword:", error);
        return res.status(500).json({ message: "Internal server error" });
      }


    }
  });
}


module.exports = { forgotPassword, resetPassword };