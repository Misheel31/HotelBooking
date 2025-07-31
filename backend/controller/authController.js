const bcrypt = require("bcrypt");
const User = require("../model/userModel");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");
const logActivity = require("../utils/activityLogger");
const { encrypt } = require("../utils/encryption");
const verifyCaptcha = require("../utils/verifyCaptcha");

const test = (req, res) => {
  res.json("test is working");
};

const registerUser = async (req, res) => {
  try {
    const { username, email, password, confirmPassword, phone, captchaToken } =
      req.body;

    if (!captchaToken) {
      return res.status(400).json({ error: "CAPTCHA verification failed" });
    }

    const isCaptchaValid = await verifyCaptcha(captchaToken);
    if (!isCaptchaValid) {
      return res.status(400).json({ error: "CAPTCHA validation failed" });
    }

    if (!username || !email || !password || !confirmPassword || !phone) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (password.length < 8) {
      return res
        .status(400)
        .json({ error: "Password must be at least 8 characters long" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&]).{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        error:
          "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email is already registered" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = Date.now() + 15 * 60 * 1000;

    const encryptedPhone = encrypt(phone);

    const user = new User({
      username,
      email,
      password,
      phone: encryptedPhone,
      otp,
      otpExpiry,
    });
    await user.save();

    await logActivity({
      req,
      userId: user._id,
      action: "USER_REGISTER",
      details: {
        username: user.username,
        email: user.email,
      },
    });

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    try {
      await transporter.sendMail({
        from: '"Hotel Booking" <misheelrai7@gmail.com>',
        to: user.email,
        subject: "Verify Your Account - OTP",
        html: `
          <h1>Welcome to Our App!</h1>
          <p>Your OTP is <b>${otp}</b>. It expires in 15 minutes.</p>
        `,
      });
    } catch (emailError) {
      console.error("Error sending OTP email:", emailError);
    }

    res.status(201).json({
      mfaRequired: true,
      message: "User registered successfully. OTP sent to email.",
      userId: user._id,
    });
  } catch (error) {
    console.error("Error during registration:", error.message);
    res.status(500).json({ error: "An error occurred during registration" });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  console.log("Request body:", req.body);
  console.log("Email:", email);
  console.log("Password sent:", password);

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    console.log("Stored password hash:", user.password);

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid password" });
    }

    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "90d" }
    );

    if (user.role === "admin") {
      const token = jwt.sign(
        { id: user._id, username: user.username, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "90d" }
      );

      user.tokens = user.tokens.concat({ token });
      await user.save();

      await logActivity({
        req,
        userId: user._id,
        action: "ADMIN_LOGIN_SUCCESS",
        details: {
          email: user.email,
        },
      });

      return res.status(200).json({
        message: "Admin login successful",
        userId: user._id,
        token,
      });
    }

    user.tokens = user.tokens.concat({ token });
    await user.save();

    // res.cookie("token", token, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === "production",
    //   sameSite: "Strict",
    //   maxAge: 7 * 24 * 60 * 60 * 1000,
    // });

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: '"Hotel Booking" <misheelrai7@gmail.com>',
      to: user.email,
      subject: "Login Successful",
      html: `<p>Hello ${user.username},</p>
         <p>You have successfully logged into your Hotel Booking account.</p>
         <p>If this wasn’t you, please contact our support team immediately.</p>
         <p>Thank you!</p>`,
    });

    res.status(200).json({
      message: "Login in successful",
      userId: user._id,
      token,
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "An error occurred during login" });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    if (!currentPassword || !newPassword || !confirmPassword)
      return res.status(400).json({ error: "All fields are required" });

    if (newPassword !== confirmPassword)
      return res.status(400).json({ error: "New passwords do not match" });

    const user = req.user;

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );
    console.log("Password valid:", isPasswordValid);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid password" });
    }

    user.password = newPassword;
    await user.save();

    await logActivity({
      req,
      userId: user._id,
      action: "USER_PASSWORD_CHANGED",
      details: {
        email: user.email,
      },
    });

    res.json({ success: "Password changed successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error changing password" });
  }
};

const forgotPassword = async (req, res) => {
  try {
    let { email } = req.body;
    email = email.trim().toLowerCase();

    const user = await User.findOne({ email });

    if (!user) {
      console.log("User not found:", email);
      return res.status(404).json({ error: "No user found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const otpExpiry = Date.now() + 15 * 60 * 1000;
    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    await logActivity({
      req,
      userId: user._id,
      action: "USER_FORGOT_PASSWORD_OTP_SENT",
      details: {
        email: user.email,
      },
    });

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Send OTP email
    await transporter.sendMail({
      from: '"Ho" <misheelrai7@gmail.com>',
      to: user.email,
      subject: "Your OTP for Password Reset",
      html: `<p>Your OTP code is <b>${otp}</b>. It expires in 15 minutes.</p>`,
    });

    res.status(200).json({ message: "OTP sent to email" });
  } catch (error) {
    console.error("Error in forgotPassword:", error);
    res.status(500).json({ status: "Internal Server Error" });
  }
};

const resetPassword = async (req, res) => {
  const { email, newPassword, otp } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!user.otp || !user.otpExpiry) {
      return res
        .status(400)
        .json({ error: "OTP not found, please request again" });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    if (Date.now() > user.otpExpiry) {
      return res.status(400).json({ error: "OTP expired" });
    }
    // const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = newPassword;
    user.otp = null;
    user.otpExpiry = null;

    await user.save();

    await logActivity({
      req,
      userId: user._id,
      action: "USER_PASSWORD_RESET",
      details: {
        email: user.email,
      },
    });

    res.json({ success: "Password updated successfully!" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while resetting the password" });
  }
};

const logoutUser = async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  await logActivity({
    req,
    userId: req.user ? req.user._id : null,
    action: "USER_LOGOUT",
    details: {},
  });
  res.status(200).json({ message: "Logged out successfully" });
};

const verifyLoginOTP = async (req, res) => {
  const { userId, otp } = req.body;
  console.log("Received OTP verification request:", req.body);

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    console.log("User OTP in DB:", user.otp);
    console.log("OTP expiry timestamp:", user.otpExpiry);
    console.log("Current timestamp:", Date.now());
    console.log("OTP from request:", otp);

    if (!user.otp || !user.otpExpiry || Date.now() > user.otpExpiry) {
      return res.status(400).json({ error: "OTP expired or not found" });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    user.otp = null;
    user.otpExpiry = null;

    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    user.tokens = user.tokens.concat({ token });
    await user.save();

    await logActivity({
      req,
      userId: user._id,
      action: "USER_LOGIN_SUCCESS",
      details: {
        email: user.email,
      },
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Login successful",
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res
      .status(500)
      .json({ error: "An error occurred during OTP verification" });
  }
};

module.exports = {
  test,
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  changePassword,
  logoutUser,
  verifyLoginOTP,
};
