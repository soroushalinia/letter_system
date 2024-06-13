const express = require('express');
const bcrypt = require('bcryptjs');
const AppDataSource = require('../data-source');
const { User } = require('../entity/user');
const router = express.Router();

router.post('/register', async (req, res) => {
  const { username, password, role } = req.body;
  const userRepository = AppDataSource.getRepository(User);

  const user = userRepository.create({ username, password, role });
  await userRepository.save(user);
    console.log(req.body)
  res.json({ message: 'User registered successfully' });
});

// router.post('/login', async (req, res) => {
//   const { username, password } = req.body;
//   const userRepository = AppDataSource.getRepository(User);
//   const user = await userRepository.findOne({ where: { username } });

//   if (!user || !bcrypt.compareSync(password, user.password)) {
//     return res.status(401).json({ message: 'Invalid username or password' });
//   }

//   req.session.user = { id: user.id, username: user.username, role: user.role };
//   res.json({ message: 'Login successful', user: { username: user.username, role: user.role } });
// });

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    // Check if username and password are defined and non-empty
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required.' });
    }
  
    try {
      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOne({ where: { username } });
  
      if (user && bcrypt.compareSync(password, user.password)) {
        // Passwords match
        req.session.user = user;
        return res.json({ message: 'Login successful', user: user.role });
      } else {
        // Username or password is incorrect
        return res.status(401).json({ message: 'Unauthorized' });
      }
    } catch (error) {
      console.error('Error during login:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });
  

router.post('/logout', (req, res) => {
  req.session.destroy();
  res.json({ message: 'Logout successful' });
});

module.exports = router;
