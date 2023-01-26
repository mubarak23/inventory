import { Schema, model } from 'mongoose';
import pkg from 'bcryptjs';

const { genSalt, hash } = pkg;

const userShema = Schema(
  {
    firstName: {
      type: String,
      required: [true, 'Please Provide a First Name'],
    },
    lastName: {
      type: String,
      required: [true, 'Please Provide a Last Name'],
    },
    emailAddress: {
      type: String,
      required: [true, 'Please add a email'],
      unique: true,
      trim: true,
      // match: [
      //   /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      //   'Please enter a valid emaial',
      // ],
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minLength: [6, 'Password must be up to 6 characters'],
      //   maxLength: [23, "Password must not be more than 23 characters"],
    },
    photo: {
      type: String,
      required: [true, 'Please add a photo'],
      default:
        'https://res.cloudinary.com/techarewa-com/image/upload/v1633352938/lfliv4hbmw7idobwhrrq.jpg',
    },
    phoneNumber: {
      type: String,
      default: '+234',
    },
    bio: {
      type: String,
      maxLength: [250, 'Bio must not be more than 250 characters'],
      default: 'bio',
    },
  },
  {
    timestamps: true,
  }
);

userShema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await genSalt(15);
  const hashpassword = await hash(this.password, salt);
  this.password = hashpassword;
  next();
});

const UserModel = model('User', userShema);

export default UserModel;
