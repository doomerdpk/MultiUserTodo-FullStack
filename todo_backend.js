const express = require("express");
const app = express();
const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
const cors = require("cors");

app.use(cors());

const JWT_SECRET = "deepak@$123";

const usersPath = path.join(__dirname, "users.json");
const usersDataDir = path.join(__dirname, "usersData");

app.use(express.json());

function ensureUsersDataDirExists() {
  if (!fs.existsSync(usersDataDir)) {
    fs.mkdirSync(usersDataDir);
  }
}

async function readJsonFile(filePath) {
  return new Promise(function (resolve, reject) {
    fs.readFile(filePath, "utf-8", (err, data) => {
      if (err) {
        return reject(err);
      }

      resolve(data ? JSON.parse(data) : []);
    });
  });
}

async function writeJsonFile(filePath, data) {
  return new Promise(function (resolve, reject) {
    fs.writeFile(filePath, JSON.stringify(data, null, 2), (err) => {
      if (err) {
        return reject(err);
      }

      resolve();
    });
  });
}

function findUserIndex(users, username) {
  return users.findIndex((user) => user.username === username);
}

app.post("/signup", async function (req, res) {
  if (!req.body.username || !req.body.password) {
    res.json({
      error: "Please provide your username and password to register!",
    });
    return;
  }

  ensureUsersDataDirExists();
  const username = req.body.username;
  const password = req.body.password;

  try {
    const users = await readJsonFile(usersPath);
    if (findUserIndex(users, username) < 0) {
      users.push({
        username: username,
        password: password,
      });

      await writeJsonFile(usersPath, users);
      const userFilePath = path.join(usersDataDir, `${username}.json`);
      fs.writeFileSync(userFilePath, "");

      res.json({
        message:
          "You are successfully signed up, Please login to access your todos!",
      });
    } else {
      res.json({
        error: `User with ${username} username already exists, Please provide an unique username!`,
      });
      return;
    }
  } catch (err) {
    res.json({
      error: "Sign-up error!",
    });
  }
});

const users = app.post("/signin", async function (req, res) {
  if (!req.body.username || !req.body.password) {
    res.json({
      error: "Please provide your credientials to login!",
    });
    return;
  }

  const username = req.body.username;
  const password = req.body.password;

  try {
    const users = await readJsonFile(usersPath);

    const user = users.find(
      (user) => user.username === username && user.password == password
    );

    if (user) {
      const token = jwt.sign(
        {
          username: username,
        },
        JWT_SECRET
      );

      res.json({
        message: "You are successfully signed in!",
        token: token,
      });
    } else {
      res.json({
        error: "Invalid credientials!",
      });
      return;
    }
  } catch (error) {
    res.json({
      error: "Sign-in error!",
    });
  }
});

function authentication(req, res, next) {
  const token = req.headers.token;
  if (token) {
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        res.json({
          error: "You are not authorized!",
        });
        return;
      } else {
        req.username = decoded.username;
        next();
      }
    });
  } else {
    res.json({
      error: "Authentication error!",
    });
  }
}

app.get("/get-todos", authentication, async function (req, res) {
  try {
    const filePath = path.join(usersDataDir, `${req.username}.json`);
    const userData = await readJsonFile(filePath);

    if (userData.length == 0) {
      res.json({
        message: "Empty To-Do List!",
        username: req.username,
      });
    } else {
      res.json({
        message: userData,
        username: req.username,
      });
    }
  } catch (error) {
    res.json({
      error: "Not able to retrieve the todos!",
    });
  }
});

app.post("/create-todo", authentication, async function (req, res) {
  const id = parseInt(req.body.id);
  if (!req.body.title || !id) {
    res.json({
      error: "Please provide the id and title to create the todo",
    });
    return;
  }

  try {
    const filePath = path.join(usersDataDir, `${req.username}.json`);
    const todos = await readJsonFile(filePath);

    const todoIndex = todos.findIndex((todo) => todo.id == id);

    if (todoIndex < 0) {
      todos.push({
        title: req.body.title,
        id: id,
      });

      await writeJsonFile(filePath, todos);
      res.json({
        message: `Successfully created a todo with id ${id}`,
      });
    } else {
      res.json({
        error: `todo with id ${id} already exists for you, please use another id for creating this todo`,
      });
      return;
    }
  } catch (error) {
    res.json({
      error: "Error creating the todo!",
    });
  }
});

app.put("/update-todo/:idx", authentication, async function (req, res) {
  const id = parseInt(req.params.idx);

  if (!req.body.title || !id) {
    res.json({
      error: "Please provide the updated title and id to update this todo!",
    });
    return;
  }

  try {
    const filePath = path.join(usersDataDir, `${req.username}.json`);
    const todos = await readJsonFile(filePath);

    const todoIndex = todos.findIndex((todo) => todo.id == id);

    if (todoIndex < 0) {
      res.json({
        error: `todo with id ${id} does not exist in your to-do list`,
      });
      return;
    } else {
      todos[todoIndex].title = req.body.title;
      await writeJsonFile(filePath, todos);

      res.json({
        message: `Successfully updates the todo with id ${id}`,
      });
    }
  } catch (error) {
    res.json({
      error: `Error updating the todo with id ${id}`,
    });
  }
});

app.delete("/delete-todo/:idx", authentication, async function (req, res) {
  const id = parseInt(req.params.idx);

  if (!id) {
    res.json({
      error: "Please provide the id of the todo to delete!",
    });
    return;
  }
  try {
    const filePath = path.join(usersDataDir, `${req.username}.json`);
    const todos = await readJsonFile(filePath);

    const todoIndex = todos.findIndex((todo) => todo.id == id);

    if (todoIndex < 0) {
      res.json({
        error: `todo with id ${id} does not exist in your to-do list`,
      });
      return;
    } else {
      todos.splice(todoIndex, 1);
      await writeJsonFile(filePath, todos);
      res.json({
        message: `Successfully deleted the todo with id ${id}`,
      });
    }
  } catch (error) {
    res.jsob({
      error: `Error deleting the todo with id ${id}`,
    });
  }
});

//app.listen(3000, function () {
//  console.log("Backend is running on http://localhost:3000");
//});
