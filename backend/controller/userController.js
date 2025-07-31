const User = require("../model/userModel");
const nodemailer = require("nodemailer");
const { decrypt } = require("../utils/encryption");

const findAll = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (e) {
    res.json(e);
  }
};

const save = async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      post: 587,
      secure: false,
      protocol: "smtp",
      auth: {
        user: "misheelrai7@gmail.com",
        pass: "xrkq aaze gzsr ssvb",
      },
    });

    const info = await transporter.sendMail({
      from: "misheelrai7@gmail.com",
      to: user.email,
      subject: "User Registration",
      html: `
      <h1> Your Registration has been Completed</h1>
      <p>Your user id is ${user.id}</p>
      `,
    });

    res.start(201).json({ user, info });
  } catch (e) {
    res.json(e);
  }
};

const findById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user.phone) {
      user.phone = decrypt(user.phone);
    }
    res.status(200).json(user);
  } catch (e) {
    res.json(e);
  }
};

const deleteById = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    res.status(200).json("Data deleted");
  } catch (e) {
    res.json(e);
  }
};

const update = async (req, res) => {
  try {
    if (req.body.phone) {
      req.body.phone = encrypt(req.body.phone);
    }
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.status(200).json("Profile Updated");
  } catch (e) {
    res.json(e);
  }
};

const uploadImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).json("Please upload a file");
  }
  res.status(200).json({
    message: "File Uploaded Successfully",
    data: req.file.filename,
  });
};
module.exports = {
  findAll,
  save,
  findById,
  deleteById,
  update,
  uploadImage,
};
