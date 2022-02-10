const Router = require('express');
const router = new Router();
const AuthController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/me',authMiddleware, AuthController.isAuthMe);
router.post('/login', AuthController.setLoginUser);
router.delete('/login',authMiddleware, AuthController.setAuthUserDisable);

module.exports = router;