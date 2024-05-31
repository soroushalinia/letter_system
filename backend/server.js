require('dotenv').config(); 

const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const cors = require('cors');


const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: 'http://localhost:3000', // React app URL
  credentials: true
}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
  secret: process.env.SESSION_SECRET, // Use the secret key from environment variables
  resave: false,
  saveUninitialized: true
}));

// Mock user data (in a real application, use a database)
const users = [
  { username: 'client', password: bcrypt.hashSync('clientpass', 10), role: 'client' },
  { username: 'admin', password: bcrypt.hashSync('adminpass', 10), role: 'admin' },
  { username: 'superadmin', password: bcrypt.hashSync('superadminpass', 10), role: 'superadmin' }
];

// Middleware to check if user is authenticated
function isAuthenticated(req, res, next) {
  if (req.session.user) {
    return next();
  }
  res.status(401).json({ message: 'Unauthorized' });
}

// Middleware to check user roles
function authorize(roles) {
  return (req, res, next) => {
    if (roles.includes(req.session.user.role)) {
      return next();
    }
    res.status(403).json({ message: 'Forbidden' });
  };
}

// Login route
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);

  if (user && bcrypt.compareSync(password, user.password)) {
    req.session.user = user;
    return res.json({ message: 'Login successful', user: user.role });
  }

  res.status(401).json({ message: 'Unauthorized' });
});

// Logout route
app.post('/logout', (req, res) => {
  req.session.destroy();
  res.json({ message: 'Logout successful' });
});

// Protected routes
app.get('/protected', isAuthenticated, (req, res) => {
  res.json({ message: `Hello ${req.session.user.role}, you are logged in.` });
});

app.get('/admin', isAuthenticated, authorize(['admin', 'superadmin']), (req, res) => {
  res.json({ message: 'Welcome to the admin area.' });
});

app.get('/superadmin', isAuthenticated, authorize(['superadmin']), (req, res) => {
  res.json({ message: 'Welcome to the super admin area.' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
