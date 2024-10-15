const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser"); // Import cookie-parser

const app = express();
const PORT = 3000;

// Sử dụng body-parser để xử lý request body
app.use(bodyParser.urlencoded({ extended: true }));

// Sử dụng cookie-parser
app.use(cookieParser());

// Cấu hình session với thời gian tồn tại là 1 phút (60,000ms)
app.use(
  session({
    secret: "your_secret_key", // Khóa bí mật dùng để mã hóa session
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60 * 1000, secure: false }, // 1 phút
  })
);

// Mock dữ liệu người dùng
const users = {
  user1: "password1",
  user2: "password2",
};

// Sử dụng EJS làm view engine
app.set("view engine", "ejs");

// Middleware kiểm tra session hợp lệ
const checkSession = (req, res, next) => {
  if (!req.session.username) {
    res.clearCookie("SESSION_ID_AUTH"); // Xóa cookie nếu session hết hạn
    res.send(`
      <script>
        alert('Session expired. You have been logged out.');
        window.location.href = '/login';
      </script>
    `);
  } else {
    next();
  }
};

// Trang chính - bảo vệ bằng middleware checkSession
app.get("/", checkSession, (req, res) => {
  const sessionId = req.session.id; // Lấy session ID
  res.cookie("SESSION_ID_AUTH", sessionId); // Lưu session ID vào cookie
  res.send(`
    <h1>Hello, ${req.session.username}!</h1>
    <p>Your session ID is: ${sessionId}</p>
    <p>Saved in cookie as: <strong>SESSION_ID_AUTH</strong></p>
    <a href='/logout'>Logout</a>
  `);
});

// Trang login
app.get("/login", (req, res) => {
  res.render("login", {
    usernameHint: "Username: user1",
    passwordHint: "Password: password1",
  });
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (users[username] && users[username] === password) {
    req.session.username = username; // Lưu thông tin vào session
    res.redirect("/");
  } else {
    res.send('Invalid username or password. <a href="/login">Try again</a>');
  }
});

// Logout
app.get("/logout", (req, res) => {
  res.clearCookie("SESSION_ID_AUTH"); // Xóa cookie
  req.session.destroy(); // Xóa session
  res.redirect("/login");
});

// Khởi động server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
