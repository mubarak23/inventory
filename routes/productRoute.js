import { Router } from 'express';
import protect from '../middlewares/authMiddleware';
import {
  addProduct,
  getProduct,
  getProducts,
  updateProduct,
  deleteProduct,
} from '../controllers/productController';
import { upload } from '../utils/uploadfile';
const router = Router();

router.post('/', protect, upload.single('image'), addProduct);
router.patch('/:id', protect, updateProduct);
router.get('/:id', protect, getProduct);
router.get('/', protect, getProducts);
router.delete('/:id', protect, deleteProduct);

export default router;
