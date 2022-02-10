const Router = require('express');
const router = new Router();
const UserController = require('../controllers/usersController')


router.get('/', UserController.getUsers);

module.exports = router;