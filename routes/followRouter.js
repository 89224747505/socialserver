const Router = require('express');
const router = new Router();
const FollowController = require('../controllers/followController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/:userId?', authMiddleware, FollowController.getCheckFollowedUserId);
router.post('/:userId?', authMiddleware, FollowController.setFollowUserId);
router.delete('/:userId?', authMiddleware, FollowController.setUnfollowUserId);


module.exports = router;