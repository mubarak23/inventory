import { Router } from 'express';
import protect from '../middlewares/authMiddleware';
import {
  registerUser,
  loginUser,
  logOut,
  getUser,
  loginStatus,
  updateUser,
  changePassword,
  forgetPassword,
  resetPassword,
} from '../controllers/userController';

const router = Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/logout', logOut);
router.get('/loggedIn', loginStatus);
router.get('getuser', protect, getUser);
router.get('/changepassword', protect, changePassword);
router.get('/forgetpassword', protect, forgetPassword);
router.get('/resetpassword/:resetToken', resetPassword);
router.patch('/updateuser', protect, updateUser);

export default router;
