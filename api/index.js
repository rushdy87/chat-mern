const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const User = require('./models/User');
const Message = require('./models/Message');
const WebSocket = require('ws');

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

const getUserDataFromRequist = async (req) => {
  return new Promise((resolve, reject) => {
    const token = req.cookies?.chat_mern_token;

    if (token) {
      jwt.verify(token, jwtSecret, {}, (error, userData) => {
        if (error) throw error;
        resolve(userData);
      });
    } else {
      reject('no token');
    }
  });
};

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

app.get('/messages/:userId', async (req, res) => {
  const { userId } = req.params;
  const { userId: ourUserId } = await getUserDataFromRequist(req);
  const messages = await Message.find({
    sender: { $in: [userId, ourUserId] },
    recipient: { $in: [userId, ourUserId] },
  }).sort({ createdAt: 1 });

  res.json(messages);
});

const server = app.listen(PORT, () => {
  console.log('Listenning on Port ', PORT);
});

const wsServer = new WebSocket.WebSocketServer({ server });
wsServer.on('connection', (connection, req) => {
  // Read the username and id from the cookie for this connection
  const cookies = req.headers.cookie;
  if (cookies) {
    const tokenCookieString = cookies
      .split(';')
      .find((str) => str.startsWith('chat_mern_token='));
    if (tokenCookieString) {
      const token = tokenCookieString.split('=')[1];
      if (token) {
        jwt.verify(token, jwtSecret, {}, (error, userData) => {
          if (error) throw error;
          const { userId, username } = userData;
          connection.userId = userId;
          connection.username = username;
        });
      }
    }
  }

  connection.on('message', async (message) => {
    const { recipient, text } = JSON.parse(message.toString());
    if (recipient && text) {
      const messageDocument = await Message.create({
        sender: connection.userId,
        recipient,
        text,
      });
      [...wsServer.clients]
        .filter((client) => client.userId === recipient)
        .forEach((client) => client.send(JSON.stringify(messageDocument)));
    }
  });

  // Notify everyone about online people (when some one connects)
  [...wsServer.clients].forEach((client) => {
    client.send(
      JSON.stringify({
        online: [...wsServer.clients].map((c) => ({
          userId: c.userId,
          username: c.username,
        })),
      })
    );
  });
});
