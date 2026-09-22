function getUsers() {
  return JSON.parse(localStorage.getItem("glow_users")) || [];
}

function registerUser(event) {
  event.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim().toLowerCase();
  const phone = document.getElementById("phone").value.trim();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  if (password !== confirmPassword) {
    alert("Passwords do not match!");
    return;
  }

  let users = getUsers();
  const userExists = users.some(u => u.email === email);

  if (userExists) {
    alert("An account with this email already exists!");
    return;
  }

  const newUser = { name, email, phone, password };
  users.push(newUser);
  localStorage.setItem("glow_users", JSON.stringify(users));

  localStorage.setItem("glow_logged_in_user", JSON.stringify(newUser));
  alert("Registration successful! Welcome to Glow Beauty.");
  window.location.href = "index.html";
}

function loginUser(event) {
  event.preventDefault();

  const email = document.getElementById("email").value.trim().toLowerCase();
  const password = document.getElementById("password").value;

  let users = getUsers();
  const validUser = users.find(u => u.email === email && u.password === password);

  if (!validUser) {
    alert("Invalid email or password!");
    return;
  }

  localStorage.setItem("glow_logged_in_user", JSON.stringify(validUser));
  alert("Login successful!");
  window.location.href = "index.html";
}

function logoutUser() {
  localStorage.removeItem("glow_logged_in_user");
  window.location.reload();
}