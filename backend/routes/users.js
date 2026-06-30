const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getAllUsers, getUserById, updateUser } = require('../controllers/userController');
const auth = require('../middleware/auth');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/', auth, getAllUsers);
router.get('/:id', auth, getUserById);
router.put('/:id', auth, updateUser);

module.exports = router;
