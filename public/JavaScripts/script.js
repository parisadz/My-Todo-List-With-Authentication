const taskInput = document.querySelector(".task-input input"),
  filters = document.querySelectorAll(".filters span"),
  clearAll = document.querySelector(".clear-btn"),
  taskBox = document.querySelector(".task-box"),
  addBtn = document.querySelector(".add-btn"),
  downBtn = document.querySelector(".down-btn"),
  upBtn = document.querySelector(".up-btn"),
  dateEl = document.querySelector(".date"),
  nameInput = document.querySelector("#name"),
  username = localStorage.getItem("username") || "";

let editId;
let isEditedTask = false;

nameInput.value = username;

nameInput.addEventListener("change", (e) => {
  localStorage.setItem("username", e.target.value);
});

// getting localstorage todo-list
let todos = JSON.parse(localStorage.getItem("todo-list"));

filters.forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelector("span.active").classList.remove("active");
    btn.classList.add("active");
    showTodo(btn.id);
  });
});

function showTodo(filter) {
  let li = "";
  if (todos) {
    todos.forEach((todo, id) => {
      // if todo status is completed, se the isCompleted value to checked
      let isCompleted = todo.status == "completed" ? "checked" : "";
      if (filter == todo.status || filter == "all") {
        li += `<li class="task">
                        <label for="${id}">
                        <input onclick="updateStatus(this)" type="checkbox" id="${id}" ${isCompleted} />
                        <p class="${isCompleted}">${todo.text}</p>
                    </label>
                    <div class="settings">
                            <i onclick="showMenu(this)" class="uil uil-ellipsis-h"></i>
                            <ul class="task-menu">
                                <li onclick="editTask(${id}, '${todo.text}')"><i class="uil uil-pen">Edit</i></li>
                                <li onclick="deleteTask(${id})"><i class="uil uil-trash">Delete</i></li>
                            </ul>
                    </div>
                </li>`;
      }
    });
  }
  // if li isn't empty, insert this this value inside taskbox else insert span
  taskBox.innerHTML = li || `<span>You don't have any task here.</span>`;
}
showTodo("all", "");

function showMenu(selectedTask) {
  // getting task menu div
  let taskMenu = selectedTask.parentElement.lastElementChild;
  taskMenu.classList.add("show");
  document.addEventListener("click", (e) => {
    // removing show class from the task menu on the document click
    if (e.target.tagName !== "I" || e.target !== selectedTask) {
      taskMenu.classList.remove("show");
    }
  });
}

function editTask(taskId, taskName) {
  editId = taskId;
  isEditedTask = true;
  taskInput.value = taskName;
  addBtn.textContent = "Save Todo";
  alert("Now you can edit your task.😋");
}

function deleteTask(deleteId) {
  // removing selected task from array/todos
  todos.splice(deleteId, 1);
  localStorage.setItem("todo-list", JSON.stringify(todos));
  showTodo("all");
}

clearAll.addEventListener("click", () => {
  // removing all items of array/todos
  todos.splice(0, todos.length);
  localStorage.setItem("todo-list", JSON.stringify(todos));
  showTodo("all");
});

function updateStatus(selectedTask) {
  // getting paragraph that contains task name
  let taskName = selectedTask.parentElement.lastElementChild;
  if (selectedTask.checked) {
    taskName.classList.add("checked");
    // updating the status of seleted task to completed
    todos[selectedTask.id].status = "completed";
  } else {
    taskName.classList.remove("checked");
    // updating the status of seleted task to pending
    todos[selectedTask.id].status = "pending";
  }
  localStorage.setItem("todo-list", JSON.stringify(todos));
}

addBtn.addEventListener("click", addTodo);

function addTodo() {
  if (taskInput.value !== "") {
    addBtn.textContent = "Add Todo";
    let userTask = taskInput.value.trim();
    if (!isEditedTask) {
      // if isEditedTask isn't true
      if (!todos) {
        // if todos isn't exist, pass an empty array to todos
        todos = [];
      }
      let taskInfo = { text: userTask, status: "pending" };
      todos.push(taskInfo); // adding new task to todos
    } else {
      isEditedTask = false;
      todos[editId].text = userTask;
    }
    taskInput.value = "";
    localStorage.setItem("todo-list", JSON.stringify(todos));
    showTodo("all");
  }
}

taskInput.addEventListener("keyup", (e) => {
  let userTask = taskInput.value.trim();
  if (e.key == "Enter" && userTask) {
    if (!isEditedTask) {
      // if isEditedTask isn't true
      if (!todos) {
        // if todos isn't exist, pass an empty array to todos
        todos = [];
      }
      let taskInfo = { text: userTask, status: "pending" };
      todos.push(taskInfo); // adding new task to todos
    } else {
      isEditedTask = false;
      todos[editId].text = userTask;
    }
    taskInput.value = "";
    localStorage.setItem("todo-list", JSON.stringify(todos));
    showTodo("all");
  }
});

function save(todos) {
  localStorage.setItem("todo-list", JSON.stringify(todos));
}

downBtn.addEventListener("click", (e) => {
  localStorage.removeItem("todo-list");
  let removeItems = document.querySelectorAll(".todo-list");
  removeItems.forEach((remove) => {
    remove.remove();
  });
  fetch("http://localhost:3000/database/download")
    .then((response) => response.json())
    .then((downTodos) => {
      todos = downTodos;
      showTodo("all");
    });
});

upBtn.addEventListener("click", (e) => {
  let newTodos = localStorage.getItem("todo-list");

  fetch("http://localhost:3000/database/upload", {
    method: "POST",
    body: newTodos,
    headers: {
      "Content-type": "application/json; charset=UTF-8",
    },
  })
    .then(function (response) {
      if (response.ok) {
        return response.json();
      }
      return Promise.reject(response);
    })
    .catch(function (error) {
      console.warn("An error has occurred.", error);
    });
});

const date = new Date();
const year = date.getFullYear();
const month = `${date.getMonth() + 1}`.padStart(2, 0);
const day = `${date.getDate()}`.padStart(2, 0);

dateEl.textContent = `Today is: ${day}/${month}/${year}`;
