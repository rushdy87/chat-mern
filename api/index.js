const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const User = require('./models/User');

const app = express();
const PORT = 3001;
const jwtSecret = process.env.JWT_SECRET;
const bcryptSalt = bcrypt.genSaltSync(10);

app.use(
  cors({
    credentials: true,
    origin: 'http://localhost:3000',
  })
);
app.use(express.json());
app.use(cookieParser());

mongoose.connect(process.env.MDB_URL);

app.get('/profile', (req, res) => {
  const token = req.cookies?.chat_mern_token;

  if (token) {
    jwt.verify(token, jwtSecret, {}, (error, userData) => {
      if (error) throw error;
      res.json(userData);
    });
  } else {
    res.status(401).json('no token');
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const foundUser = await User.findOne({ username });
  if (foundUser) {
    const passOk = bcrypt.compareSync(password, foundUser.password);
    if (passOk) {
      jwt.sign(
        { userId: foundUser._id, username },
        jwtSecret,
        {},
        (error, token) => {
          if (error) throw error;
          res
            .cookie('chat_mern_token', token, {
              sameSite: 'none',
              secure: true,
            })
            .status(201)
            .json({
              id: foundUser._id,
            });
        }
      );
    }
  }
});

app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, bcryptSalt);
  const createdUser = await User.create({ username, password: hashedPassword });
  jwt.sign(
    { userId: createdUser._id, username },
    jwtSecret,
    {},
    (error, token) => {
      if (error) throw error;
      res
        .cookie('chat_mern_token', token, { sameSite: 'none', secure: true })
        .status(201)
        .json({
          id: createdUser._id,
        });
    }
  );
});

app.listen(PORT, () => {
  console.log('Listenning on Port ', PORT);
});