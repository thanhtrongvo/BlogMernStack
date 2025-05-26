const router = require('express').Router();
const {getAllUsers, getUserById, createUser, editUser, deleteUser} = require('../controllers/userController');
const auth = require('../middleware/auth');

router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.post('/', createUser);
router.put('/:id', editUser);
router.delete('/:id', deleteUser);
module.exports = router;
