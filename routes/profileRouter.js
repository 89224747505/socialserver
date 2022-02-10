const Router = require('express');
const router = new Router();
const ProfileController = require('../controllers/profileController');

router.put('/', ProfileController.registration);
router.put('/photo', ProfileController.setPhotoProfile);
router.put('/status', ProfileController.setStatusProfile);
router.get('/status/:userId?', ProfileController.getStatusProfileUserId);
router.get('/:userId?', ProfileController.getProfileUserId);


module.exports = router;