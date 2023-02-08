import cloudinary from 'cloudinary';
import asyncHandler from 'express-async-handler';
import Product from '../models/product';
import User from '../models/user';
import { fileSizeFormatter } from '../utils/uploadfile';

// add a new product
const addProduct = asyncHandler(async (req, res) => {
  const { name, sku, price, description, category, quantity } = req.body;

  // if (!name || !sku || !price || !description || !category || !quantity) {
  //   res.status(400);
  //   throw new Error('All Product Field are Required');
  // }

  let fileData = {};

  if (req.body.file) {
    let uploadedFile;
    try {
      uploadedFile = await cloudinary.uploader.upload(req.body.file.path, {
        folder: 'inventory',
        resource_type: 'image',
      });
    } catch (error) {
      console.log(error);
      res.status(500);
      throw new Error('Error while uploading image to cloudinary');
    }

    fileData = {
      fileName: req.file.originalname,
      filePath: uploadedFile.secure_url,
      fileType: req.file.mimetype,
      fileSize: fileSizeFormatter(req.file.size, 2),
    };
  }
  console.log(req.user._id);
  // add the product
  const product = await Product.create({
    userId: req.user._id,
    name,
    sku,
    description,
    price,
    quantity,
    category,
    image: fileData,
  });
  res.status(201).json(product);
});

const getProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ user: req.user._id }).sort(
    '-createdAt'
  );
  console.log(products);
  res.status(200).json(products);
});

const getProduct = asyncHandler(async (req, res) => {
  const product = await User.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('product with the provided ID Does Not Exist');
  }
  if (product.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('Unauthorized Request');
  }
  res.status(200).json(product);
});

const updateProduct = asyncHandler(async (req, res) => {
  const { name, category, quantity, price, description } = req.body;
  const { id } = req.params;

  const product = await User.findById(id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  if (product.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('User not authorized');
  }

  let fileData = {};
  if (req.file) {
    let uploadedFile;
    try {
      uploadedFile = await cloudinary.uploader.upload(req.file.path, {
        folder: 'inventory',
        resource_type: 'image',
      });
    } catch (error) {
      res.status(500);
      throw new Error('Image could not be uploaded');
    }

    fileData = {
      fileName: req.file.originalname,
      filePath: uploadedFile.secure_url,
      fileType: req.file.mimetype,
      fileSize: fileSizeFormatter(req.file.size, 2),
    };
  }

  // Update Product
  const updatedProduct = await Product.findByIdAndUpdate(
    { _id: id },
    {
      name,
      category,
      quantity,
      price,
      description,
      image: Object.keys(fileData).length === 0 ? product?.image : fileData,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json(updatedProduct);
});

const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('product with the provided ID Does Not Exist');
  }
  if (product.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('Unauthorized Request');
  }

  // √destroy(fileKey)
  try {
    uploadedFile = await cloudinary.uploader.destroy(product.image.filePath);
  } catch (error) {
    console.log(error);
    res.status(500);
    throw new Error('Error while deleting image on cloudinary');
  }

  await product.deleteOne();
  res.status(200).json({ message: 'Product Delete Successfully' });
});

export { addProduct, getProduct, getProducts, updateProduct, deleteProduct };
