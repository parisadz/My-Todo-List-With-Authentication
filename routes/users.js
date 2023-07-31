const express = require("express");
const router = express.Router();
const fs = require("fs");
const fsp = fs.promises;
const jwt = require("jsonwebtoken");

/** @type {string} The secret secret to sign the JWT token. */
const accessTokenSecret = "thisisthesecretaccesstoke";

/**
 * The post url for getting the login info of the user and sending the access token
 */
router.post("/login", (req, res) => {
  // Read username and password from request body
  const { username, password } = req.body;

  fs.readFile("./database/users.json", (err, data) => {
    if (err) throw err;

    const users = JSON.parse(data);

    const user = users.find((u) => {
      return u.username === username && u.password === password;
    });

    if (user) {
      const accessToken = user.token;
      const name = user.name;
      res.json({
        accessToken,
        name,
      });
    } else {
      res.json("Username or password incorrect");
    }
  });
});

router.post("/signup", async (req, res) => {
  const user = req.body;
  user.token = jwt.sign(
    { username: user.username, email: user.email },
    accessTokenSecret
  );
  const users = await fsp
    .readFile("./database/users.json", { encoding: "utf-8" })
    .then((fileData) => JSON.parse(fileData));
  const found = users.find((u) => {
    return u.email === user.email;
  });
  if (found) {
    res.status(403).json("user exist!");
    return;
  }
  users.push(user);
  await fsp.writeFile(
    "./database/users.json",
    JSON.stringify(users),
    { encoding: "utf-8" },
    (err) => {
      if (err) res.send(err);
      return;
    }
  );
  res.status(200).json(user.token);
});

router.post("/username", (req, res) => {
  const { token } = req.body;
  fs.readFile("./database/users.json", (err, data) => {
    if (err) throw err;

    const users = JSON.parse(data);

    const user = users.find((u) => {
      return u.token === JSON.parse(token);
    });

    if (user) {
      res.json(user.username);
    } else {
      res.status(403).json("user not found");
    }
  });
});

module.exports = router;
