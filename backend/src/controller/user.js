import User from "../models/users.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator"; //see docs.
import { countDays } from "../utils/countDays.js";
import multer from "multer";
import Image from "../models/image.js";

const SECRET_KEY = process.env.JWT_SECRET_KEY;

// storage
const Storage = multer.diskStorage({
  destination: "uploads",
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({
  storage: Storage,
}).single("userImage");

//signup user
export const signUpUser = async (req, res) => {
  try {
    const errors = validationResult(req); //checking for error
    if (errors.isEmpty()) {
      const existedUser = await User.findOne({ email: req.body.email });
      if (existedUser) {
        return res.status(400).send("email already in use");
      }

      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(req.body.password, salt);
      const user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword,
        dateOfBirth: new Date(req.body.dateOfBirth),
      });
      const token = jwt.sign({ _id: user._id }, SECRET_KEY);
      const { password, ...otherInfo } = user._doc; //user._doc contains user info

      return res.status(200).send({ ...otherInfo, token: token });
    } else {
      return res.status(400).send(errors);
    }
  } catch (error) {
    res.status(400).send(error);
  }
};

//login user
export const loginUser = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).send({ error: "invalid credentials" });
    }
    const matchedPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!matchedPassword) {
      return res.status(404).send({ error: "invalid credentials" });
    }
    const token = jwt.sign({ _id: user._id }, SECRET_KEY);

    const { password, ...otherInfo } = user._doc;
    return res.status(200).send({ ...otherInfo, token: token });
  } catch (error) {
    res.status(500).send(error);
  }
};

//get user
export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password"); //select method on User for selecting all fields, for excluding password use "-password"
    let userMonth = new Date(user.dateOfBirth).getMonth();
    let userDate = new Date(user.dateOfBirth).getDate();
    let currentYear = new Date().getFullYear();
    let responseData = {};
    let date_1 = new Date(`${userMonth + 1}/${userDate}/${currentYear}`); // MM/DD/YYYY
    let date_2 = new Date();
    if (userMonth === 0 && userDate < 7) {
      date_1 = new Date(`${userMonth + 1}/${userDate}/${currentYear + 1}`); // MM/DD/YYYY
    }
    let remainingDays = countDays(date_1, date_2);
    if (remainingDays < 8 && remainingDays > 0) {
      responseData.notification = `${remainingDays} days to go for your birthday`;
    }
    res.status(201).json({ ...responseData, user });
  } catch (error) {
    res.status(500).send(error);
  }
};

//upload image
export const uploadImage = async (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      console.log(err);
    } else {
      try {
        if (req.user._id.toString() === req.params.userId) {
          const image = new Image({
            userId: req.params.userId,
            name: req.user.name,
            image: {
              data: req.file.filename,
              contentType: "image/png",
            },
          });
          image.save();
          res.status(201).send("Image Uploaded Successfully.");
        } else {
          res.status(400).send("You are not authenticated.");
        }
      } catch (error) {
        res.status(400).send(error);
      }
    }
  });
};
