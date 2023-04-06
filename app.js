const { open } = require("sqlite");
const sqlit3 = require("sqlite3");
const express = require("express");
const app = express();
const path = require("path");
let dbpath = path.join(__dirname, "todoApplication.db");
app.use(express.json());

let db = null;

const instalization = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlit3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`Db ERROR ${e.message}`);
    process.exit(1);
  }
};
instalization();

const isStatus = (request) => {
  return request.status !== undefined && request.priority === undefined;
};

const isPriority = (request1) => {
  return request1.status === undefined && request1.priority !== undefined;
};

const isPriorityAndisStatus = (request1) => {
  return request1.status !== undefined && request1.priority !== undefined;
};
const isSearch_q = (request1) => {
  return request1.search_q !== "";
};
//### API 1

app.get("/todos/", async (request, response) => {
  //   console.log(request);
  const { status, priority, search_q = "" } = request.query;
  let getQuers = null;
  switch (true) {
    //Scenario 1

    case isStatus(request.query):
      getQuers = `
        select * from todo where status = '${status}'
        and todo like '%${search_q}%'
        `;
      break;

    case isPriority(request.query):
      //Scenario 2
      getQuers = `
     select * from todo where 
     priority = '${priority}'
     and todo like'%${search_q}%'
     `;

      break;
    //Scenario 3

    case isPriorityAndisStatus(request.query):
      getQuers = `
     select * from todo where 
     priority = '${priority}'
     and status = '${status}'
     `;
    case isSearch_q(request.query):
      getQuers = `
     select * from todo where 
     todo like'%${search_q}%'
     `;
  }
  const allResultQuers1 = await db.all(getQuers);
  response.send(allResultQuers1);
});

//API 2
//GET

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getWithTodoIdQuery = `

    select * from todo
    where id = '${todoId}'`;
  const getReuslt = await db.all(getWithTodoIdQuery);
  response.send(getReuslt);
});

//API 3
//`POST`

app.post("/todos/", async (request, response) => {
  const { id, todo, status, priority } = request.body;
  const postNewTodo = `
    INSERT INTO todo(id,todo,priority,status)
    VALUES(${id},'${todo}','${status}','${priority}')
    `;
  await db.run(postNewTodo);
  response.send("Todo Successfully Added");
});

//API 4

const toDoUpdate = (request) => {
  console.log(request);
  return request.todo !== undefined;
};
app.put("/todos/:todoId/", async (request, response) => {
  const { id, todo, status, priority } = request.body;
  const { todoId } = request.params;
  let updateTodo = null;
  let statusResult = null;
  console.log("///////");
  switch (true) {
    //Scenario 1
    case isStatus(request.body):
      statusResult = "Status";
      updateTodo = `
      UPDATE todo
      SET
      status = '${status}'
       where id = ${todoId}
      `;
      break;
      console.log(isPriority(request.body));
    case isPriority(request.body):
      // Scenario 2
      console.log("hello");
      statusResult = "Priority";
      updateTodo = `
      UPDATE todo
      SET
      priority = '${priority}'
       where id = ${todoId}
      `;
      break;
    case toDoUpdate(request.body):
      // Scenario 3
      statusResult = "Todo";
      updateTodo = `
      UPDATE todo
      SET
      todo = '${todo}'
       where id = ${todoId}
      `;
  }
  console.log(updateTodo);
  response.send(`${statusResult} Updated`);
});

//API 5

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodo = `
    delete from todo
    where id = ${todoId}`;
  await db.run(deleteTodo);
  response.send("Todo Deleted");
});
