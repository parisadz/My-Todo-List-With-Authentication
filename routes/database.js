const router = require("express").Router();
const fs = require("fs");
const fsp = fs.promises;
/**
 * Receives the todos in form of json and stores them in the database/todos.json file
 */
router.post("/upload", async (req, res) => {
  const { token, todos } = req.body;
  console.log(todos);
  console.log(token);
  console.log(todos);
  let users = await fsp
    .readFile("./database/users.json", { encoding: "utf-8" })
    .then((fileData) => JSON.parse(fileData));
  const found = users.find((u) => {
    return u.token === JSON.parse(token);
  });
  const newUsers = users.filter((p) => p.token !== JSON.parse(token));
  if (found) {
    found.todos = JSON.parse(todos);
    newUsers.push(found);
    await fsp.writeFile(
      "./database/users.json",
      JSON.stringify(newUsers),
      { encoding: "utf-8" },
      (err) => {
        if (err) res.send(err);
        return;
      }
    );
    res.json("success");
  } else {
    res.sendStatus(401);
  }
});

/**
 * Sends todos from the database/todos.json file as json
 */
router.post("/download", (req, res) => {
  const { token } = req.body;
  fs.readFile("./database/users.json", (err, data) => {
    if (err) throw err;

    const users = JSON.parse(data);

    const user = users.find((u) => {
      return u.token === JSON.parse(token);
    });

    if (user) {
      res.json(user.todos);
    } else {
      res.sendStatus(401);
    }
  });
});

module.exports = router;
