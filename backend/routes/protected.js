const express = require('express');
const { authenticate, authorize } = require('../middlewares/auth');
const AppDataSource = require('../data-source');
const { User } = require('../entity/user');
const router = express.Router();

router.get('/users', authenticate, authorize('admin', 'superAdmin'), async (req, res) => {
  const userRepository = AppDataSource.getRepository(User);
  const users = await userRepository.find();
  res.json(users);
});

router.get('/admin', authenticate, authorize('admin', 'superAdmin'), (req, res) => {
  res.json({ message: 'Welcome to the admin area.' });
});

router.get('/superadmin', authenticate, authorize('superAdmin'), (req, res) => {
  res.json({ message: 'Welcome to the super admin area.' });
});

module.exports = router;
