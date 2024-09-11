async function SignUp(event) {
  if (event) {
    event.preventDefault();
  }

  const username = document.getElementById("signup-username").value;
  const password = document.getElementById("signup-password").value;

  if (!username || !password) {
    alert("Please provide your credientials to Register!");
    document.getElementById("signup-username").value = "";
    document.getElementById("signup-password").value = "";
    return;
  }

  const response = await axios.post("http://localhost:3000/signup", {
    username: username,
    password: password,
  });

  if (response.data.error) {
    alert(response.data.error);
    document.getElementById("signup-username").value = "";
    document.getElementById("signup-password").value = "";
    return;
  } else {
    alert(response.data.message);
    document.getElementById("signup-username").value = "";
    document.getElementById("signup-password").value = "";
  }
}

async function SignIn(event) {
  if (event) {
    event.preventDefault();
  }
  const username = document.getElementById("signin-username").value;
  const password = document.getElementById("signin-password").value;

  if (!username || !password) {
    alert("Please provide your credientials to login!");
    document.getElementById("signin-username").value = "";
    document.getElementById("signin-password").value = "";
    return;
  }

  const response = await axios.post("http://localhost:3000/signin", {
    username: username,
    password: password,
  });

  if (response.data.error) {
    alert(response.data.error);
    document.getElementById("signin-username").value = "";
    document.getElementById("signin-password").value = "";
    return;
  } else {
    alert(response.data.message);
    localStorage.setItem("token", response.data.token);
    document.getElementById("signin-username").value = "";
    document.getElementById("signin-password").value = "";

    document.getElementById("signup").innerHTML = "";
    document.getElementById("signin").innerHTML = "";
    GetTodos();
  }
}

async function AddTodo(event) {
  console.log("AddTodo function Called!");
  if (event) {
    event.preventDefault();
  }
  const token = localStorage.getItem("token");
  const title = document.getElementById("title").value;
  const id = document.getElementById("id").value;

  if (!title || !id) {
    alert("Please provide title and id of the todo to add");
    document.getElementById("title").value = "";
    document.getElementById("id").value = "";
    return;
  }

  const response = await axios.post(
    "http://localhost:3000/create-todo",
    {
      title: title,
      id: id,
    },
    {
      headers: {
        token: token,
      },
    }
  );

  if (response.data.error) {
    alert(response.data.error);
    document.getElementById("title").value = "";
    document.getElementById("id").value = "";
    return;
  } else {
    alert(response.data.message);
    const todoEl = document.createElement("div");
    todoEl.innerHTML = title;
    document.getElementById("user-todos").appendChild(todoEl);
    document.getElementById("title").value = "";
    document.getElementById("id").value = "";

    return GetTodos();
  }
}

async function UpdateTodo(event) {
  console.log("UpdateTodo function Called!");
  if (event) {
    event.preventDefault();
  }
  const token = localStorage.getItem("token");
  const title = document.getElementById("title").value;
  const id = document.getElementById("id").value;

  if (!title || !id) {
    alert("Please provide title and id of the todo to Update!");
    document.getElementById("title").value = "";
    document.getElementById("id").value = "";
    return;
  }

  const response = await axios.put(
    "http://localhost:3000/update-todo/" + id,
    {
      title: title,
    },
    {
      headers: {
        token: token,
      },
    }
  );

  if (response.data.error) {
    alert(response.data.error);
    document.getElementById("title").value = "";
    document.getElementById("id").value = "";
    return;
  } else {
    alert(response.data.message);
    document.getElementById("title").value = "";
    document.getElementById("id").value = "";
    return GetTodos();
  }
}

async function DeleteTodo(event) {
  console.log("DeleteTodo function Called!");
  if (event) {
    event.preventDefault();
  }
  const token = localStorage.getItem("token");
  const id = document.getElementById("id").value;

  if (!id) {
    alert("Please provide id of the todo to Delete!");
    document.getElementById("id").value = "";
    return;
  }

  const response = await axios.delete(
    "http://localhost:3000/delete-todo/" + id,
    {
      headers: {
        token: token,
      },
    }
  );

  if (response.data.error) {
    alert(response.data.error);
    document.getElementById("id").value = "";
    return;
  } else {
    alert(response.data.message);
    document.getElementById("id").value = "";
    return GetTodos();
  }
}

function LogOut() {
  console.log("LogOut function Called!");
  localStorage.setItem("token", "");
  location.reload();
}

async function GetTodos() {
  console.log("GetTodos function Called!");
  document.getElementById("user-todos").innerHTML = "";
  document.getElementById("logout").innerHTML = "";
  document.querySelector("body").style.backgroundImage =
    "url('https://img.freepik.com/free-photo/top-view-international-worker-s-day-still-life_23-2150337550.jpg?w=1060&t=st=1726065353~exp=1726065953~hmac=49f41a183da0403690fcdbae922001be082b7cf77d4ba4ccd3a8213acc7ddb7a')";
  const token = localStorage.getItem("token");

  const response = await axios.get("http://localhost:3000/get-todos", {
    headers: {
      token: token,
    },
  });

  if (response.data.error) {
    alert(response.data.error);
    return;
  } else {
    const logoutHTML = `<div class="row">
  <div class="col-sm-6">
    <div class="card">
      <div class="card-body">
        <h5 class="card-title">Current Logged-in user is:<b>${response.data.username}</b> </h5>
        <button style="width: 100px;
                       height: 25px;
                       background-color: dodgerblue;
                       border: none;
                       border-radius: 5px;
                       color: white;
                       margin-left: 10px;
                       margin-right: 10px;
                       margin-top: 10px;
                       margin-bottom: 10px;" type="button" onclick="LogOut()">Logout</button>
      </div>
    </div>
  </div>`;

    const usertodosHTML = `<div class="card text-center">
  <div class="card-header">
    <h5><b>Today's Goal</b></h5>
  </div>
  <div id ="list-of-todos" class="card-body">
  </div>
  <div class="card-footer text-muted">
    <input type="text" placeholder="title..." id="title" class="edit-todos">
    <input type="text" placeholder="id..." id="id" class="edit-todos">
    <br>
    <button type="button" onclick="AddTodo()" class="todosbtn">Add-Todo</button>
    <button type="button" onclick="UpdateTodo()" class="todosbtn">Update-Todo</button>
    <button type="button" onclick="DeleteTodo()" class="todosbtn">Delete-Todo</button>
  </div>
</div>`;

    document.getElementById("user-todos").innerHTML = usertodosHTML;
    document.getElementById("logout").innerHTML = logoutHTML;

    if (response.data.message == "Empty To-Do List!") {
      document.getElementById("list-of-todos").innerHTML = "Empty To-Do List!";
    } else {
      response.data.message.sort((a, b) => a.id - b.id);
      response.data.message.forEach((item) => {
        const titleEl = document.createElement("p");
        titleEl.innerHTML = item.id + ". " + item.title;
        document.getElementById("list-of-todos").appendChild(titleEl);
      });
    }
  }
}
