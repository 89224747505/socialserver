const Router = require('express');
const router = new Router();
const securityRouter = require('./securityRouter');
const authRouter = require('./authRouter');
const usersRouter = require('./usersRouter');
const profileRouter = require('./profileRouter');
const followRouter = require('./followRouter');

router.use('/security',securityRouter);
router.use('/auth',authRouter);
router.use('/users',usersRouter);
router.use('/profile',profileRouter);
router.use('/follow',followRouter);

module.exports = router;