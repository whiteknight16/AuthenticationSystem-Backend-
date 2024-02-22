require("dotenv").config();
require("./config/database").connect();

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const express = require("express");
const app = express();

const User = require("./models/user.model");
const { auth } = require("./middlewares/auth");

app.use(express.json());
app.get("/", (req, res) => res.send("Hello World!"));

app.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (!(email && firstName && lastName && password)) {
      res.status(400).send("All fields are required");
    }

    const existingUser = await User.findOne({ email }); //Promise

    if (existingUser) res.status(401).send("User Already Exist");

    const encryptedPass = await bcrypt.hash(password, 10);

    const userObject = {
      firstName,
      lastName,
      email: email.toLowerCase(),
      password: encryptedPass,
    };

    const user = await User.create(userObject);

    //token

    const token = jwt.sign(
      { user_id: user._id, email },
      process.env.SECRET_KEY,
      {
        expiresIn: "2h",
      }
    );
    user.password = undefined;
    user.token = token;

    // Send token or yes and redirect
    res.status(200).json(user);
  } catch (error) {
    console.log(error);
  }
});

app.get("/login", async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (!(email && password && firstName && lastName))
      res.status(401).send("All fields are required ");

    const user = await User.findOne({ email });

    if (!user) {
      res.status(400).send("You are not registered in our app");
    }

    if (user && (await bcrypt.compare(password, user.password))) {
      const token = jwt.sign(
        { user_id: user._id, email },
        process.env.SECRET_KEY,
        { expiresIn: "2h" }
      );
      user.token = token;
      user.password = undefined;
      res.status(200).json(user);
    } else {
      res.status(400).send("Password incorrect");
    }
  } catch (error) {
    console.log(error);
  }
});

app.get("/dashboard", auth, (req, res) => {
  res.status(200).send("Hoooo I am at Dashboard");
});
module.exports = app;
