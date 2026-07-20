const express = require('express');
const { login, me } = require('../controllers/authController');
const protectRoute = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { loginSchema } = require('../utils/validators');

const router = express.Router();

router.post('/login', validate(loginSchema), login);
router.get('/me', protectRoute, me);

module.exports = router;
