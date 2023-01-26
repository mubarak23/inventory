import { Schema, model } from 'mongoose';

const productSchema = Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    name: {
      type: String,
      required: [true, 'Please Provide a Name'],
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Please Provide a Name'],
      trim: true,
    },
    sku: {
      type: String,
      required: true,
      default: 'SKU',
      trim: true,
    },
    quantity: {
      type: String,
      required: [true, 'Please add a quantity'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Please a Category Name'],
      trim: true,
    },
    price: {
      type: String,
      required: [true, 'Please a Price for the product'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please a Detail Description of the product'],
      trim: true,
    },
    images: {
      type: Object,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

const ProductModel = model('Product', productSchema);

export default ProductModel;
