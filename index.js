import express from 'express';
import { connect } from 'mongoose';
import cors from 'cors';
import { join } from 'path';
import cloudinary from 'cloudinary';
import errorHandleMiddleware from './middlewares/errorsHandleMiddleware';
import userRouter from './routes/userRoute';
import productRouter from './routes/productRoute';
import cookieParser from 'cookie-parser';
import pkg from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
const { json: _json } = pkg;
import {} from 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(_json());

app.use(
  cors({
    origin: ['http://localhost:3000'],
    credentials: true,
  })
);

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// app.use('/uploads', express.static(join(__dirname, 'uploads')));

app.use('/uploads', express.static(path.join(__dirname, '/uploads/')));

app.use('/api/users', userRouter);
app.use('/api/products', productRouter);

app.get('/', (req, res) => {
  res.send('We Are All Good From Here');
});

// app.use(errorHandleMiddleware);

const PORT = process.env.PORT || 5050;
connect(process.env.DB_URL || 'mongodb://localhost:27017/inventory')
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server setup at port ${PORT}`);
    });
  })
  .catch((err) => console.log(err));
