const express = require('express');
const bodyParser = require('body-parser');
const { User, RoleEnum } = require('./entity/user'); // Adjust path as needed
const { AppDataSource } = require('./data-source'); // Adjust path as needed

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(bodyParser.json()); // Parse JSON bodies
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Register endpoint
app.post('/register', async (req, res) => {
  const { username, password, role } = req.body;
  const userRepository = AppDataSource.getRepository(User);

  const user = userRepository.create({ username, password, role });
  await userRepository.save(user);

  res.json({ message: 'User registered successfully' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
