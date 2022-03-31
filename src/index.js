require("dotenv").config();
const fs = require("fs");
const express = require("express");
const app = express();
const path = require("path");
const port = 8080;
const bodyParser = require("body-parser");
const { v4: uuidv4 } = require("uuid");
const { randomUUID } = require("crypto");
const todoFilePath = process.env.BASE_JSON_PATH;

//Read todos from todos.json into variable
let todos = require(__dirname + todoFilePath);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.raw());
app.use(bodyParser.json());

app.use("/content", express.static(path.join(__dirname, "public")));

app.get("/", (_, res) => {
  res.sendFile("./public/index.html", { root: __dirname });
});

app.get("/todos", (_, res) => {
  res.header("Content-Type", "application/json");
  res.sendFile(todoFilePath, { root: __dirname });
});

// Add GET request with path '/todos/overdue'
app.get("/todos/overdue", (req, res) => {
  let today = new Date();
  res.write("[");
  todos.forEach((todo) => {
    if (Date.parse(todo.due) < today && todo.completed === false) {
      res.write(JSON.stringify(todo));
    }
  });
  res.write("]");
  res.end();
});

//Add GET request with path '/todos/completed'
app.get("/todos/completed", (req, res) => {
  res.write("[");
  todos.forEach((todo) => {
    if (todo.completed === true) {
      res.write(JSON.stringify(todo));
    }
  });
  res.write("]");
  res.send();
});

app.get("/todos/:id", (req, res) => {
  let id = req.params.id;
  todos.forEach((todo) => {
    if (id == todo.id) {
      res.send(todo);
    }
  });
  res.status(404).send("Profile not found");
});

//Add POST request with path '/todos'
app.post("/todos", (req, res) => {
  if (req.body.name === undefined || req.body.due === undefined) {
    res.status(400).send("Incorrect data submitted");
  } else {
    todos.push({
      id: `${randomUUID()}`,
      name: `${req.body.name}`,
      created: `${new Date().toJSON()}`,
      due: `${req.body.due}`,
      completed: false,
    });
    fs.writeFileSync(__dirname + todoFilePath, `${JSON.stringify(todos)}`);
    res.status(201).send("Success");
  }
});

//Add PATCH request with path '/todos/:id
app.patch("/todos/:id", (req, res) => {
  todos.forEach((todo) => {
    if (req.params.id === todo.id) {
      if (req.body.name !== undefined && req.body.due !== undefined) {
        todo.name = req.body.name;
        todo.due = req.body.due;
        fs.writeFileSync(__dirname + todoFilePath, `${JSON.stringify(todos)}`);
        res.status(200).send("Success");
      }
      if (req.body.name !== undefined && req.body.due === undefined) {
        todo.name = req.body.name;
        fs.writeFileSync(__dirname + todoFilePath, `${JSON.stringify(todos)}`);
        res.status(200).send("Success");
      }
      if (req.body.due !== undefined && req.body.name === undefined) {
        todo.due = req.body.due;
        fs.writeFileSync(__dirname + todoFilePath, `${JSON.stringify(todos)}`);
        res.status(200).send("Success");
      }
      if (req.body.due === undefined && req.body.name === undefined) {
        res.status(400).send("Invalid request");
      }
    }
  });
  res.status(400).send("Invalid ID");
});

//Add POST request with path '/todos/:id/complete
app.post("/todos/:id/complete", (req, res) => {
  todos.forEach((todo) => {
    if (req.params.id === todo.id) {
      todo.completed = true;
      fs.writeFileSync(__dirname + todoFilePath, `${JSON.stringify(todos)}`);
      res.status(200).send("Success");
    }
  });
  res.status(400).send("Invalid ID");
});

//Add POST request with path '/todos/:id/undo
app.post("/todos/:id/undo", (req, res) => {
  todos.forEach((todo) => {
    if (req.params.id === todo.id) {
      todo.completed = false;
      fs.writeFileSync(__dirname + todoFilePath, `${JSON.stringify(todos)}`);
      res.status(200).send("Success");
    }
  });
  res.status(400).send("Invalid ID");
});

//Add DELETE request with path '/todos/:id
app.delete("/todos/:id", (req, res) => {
  for (var i = 0; i < todos.length; i++) {
    if (todos[i].id === req.params.id) {
      todos.splice(i, 1);
      fs.writeFileSync(__dirname + todoFilePath, `${JSON.stringify(todos)}`);
      res.status(200).send("Todo deleted");
    }
  }
  res.status(400).send("ID Not Found");
});

//Alternative Delete request
// app.delete("/todos/:id", (req, res) => {
//   todos.forEach((todo) => {
//     if (req.params.id === todo.id) {
//       newTodos = todos.filter((todo) => req.params.id !== todo.id);

//       fs.writeFileSync(__dirname + todoFilePath, `${JSON.stringify(newTodos)}`);
//       res.status(200).send("Todo deleted");
//     }
//   });
//   res.status(400).send("ID Not Found");
// });

app.listen(port, function () {
  console.log(`Node server is running... http://localhost:${port}`);
});

module.exports = app;
