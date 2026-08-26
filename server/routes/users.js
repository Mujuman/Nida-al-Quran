const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getAllUsers, getUserById, updateUser, getStatistics } = require('../controllers/userController');
const auth = require('../middleware/auth');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/stats', getStatistics);
router.get('/', auth, getAllUsers);
router.get('/:id', auth, getUserById);
router.put('/:id', auth, updateUser);

module.exports = router;
