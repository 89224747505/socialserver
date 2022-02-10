const Router = require('express');
const router = new Router();
const SecurityController = require('../controllers/securityController');

router.get('/get-captcha-url', SecurityController.getCaptchaUrl);

module.exports = router;