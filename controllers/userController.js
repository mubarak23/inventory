import User from '../models/user';
import asyncHandler from 'express-async-handler';
import pkg from 'jsonwebtoken';
import Token from '../models/token';
import pkgs from 'bcryptjs';
import { randomBytes, createHash } from 'crypto';
import sendMail from '../utils/sendMail';
const { compare } = pkgs;
const { sign, verify } = pkg;

const generateToken = (id) => {
  return sign({ id }, process.env.JWT_SECRET, { expiresIn: '2d' });
};

const registerUser = asyncHandler(async (req, res) => {
  const { firstName, lastName, emailAddress, password, phoneNumber, bio } =
    req.body;

  if (!firstName || !lastName || !emailAddress || !password) {
    res.status(400);
    throw new Error('All Fields are required');
  }

  if (password.length < 6) {
    res.status(400);
    throw new Error('Password must up to Six character');
  }

  const userEXist = await User.findOne({ emailAddress });

  if (userEXist) {
    res.status(400);
    throw new Error(
      'User with provided email address already have an account, procced to login'
    );
  }

  const user = await User.create({
    firstName,
    lastName,
    emailAddress,
    password,
    phoneNumber,
    bio,
  });

  const token = generateToken(user._id);
  res.cookie('token', token, {
    path: '/',
    httpOnly: true,
    expires: new Date(Date.now() + 1000 * 86400), // 1 day
    sameSite: 'none',
    secure: true,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      firstName,
      lastName,
      emailAddress,
      phoneNumber,
      bio,
      photo: user.photo,
      token,
    });
  } else {
    res.status(400);
    throw Error('Invalid  User Data');
  }
});

const loginUser = asyncHandler(async (req, res) => {
  const { emailAddress, password } = req.body;

  if (!emailAddress || !password) {
    res.status(400);
    throw new Error('Please Provide an Email Address and a Password');
  }

  const user = await User.findOne({ emailAddress });

  if (!user) {
    res.status(400);
    throw new Error('User Doest Not Exist, Please Proceed to Signup');
  }

  const isPaawordCorrect = await compare(password, user.password);

  const loginToken = generateToken(user._id);

  if (isPaawordCorrect) {
    // Send HTTP-only cookie
    res.cookie('token', loginToken, {
      path: '/',
      httpOnly: true,
      expires: new Date(Date.now() + 1000 * 86400), // 1 day
      sameSite: 'none',
      secure: true,
    });
  }
  if (user && isPaawordCorrect) {
    const { firstName, lastName, emailAddress, photo, phoneNumber, bio, _id } =
      user;
    res.status(200).json({
      firstName,
      lastName,
      emailAddress,
      phoneNumber,
      photo,
      bio,
      token: loginToken,
    });
  } else {
    res.status(400);
    throw new Error('Invalid Credentials');
  }
});

const logOut = asyncHandler(async (req, res) => {
  res.cookie('token', '', {
    path: '/',
    httpOnly: true,
    expires: new Date(0),
    sameSite: 'none',
    secure: true,
  });
  return res.status(200).json({ message: 'Successfully Logged Out' });
});

const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (user) {
    const { firstName, lastName, emailAddress, photo, phoneNumber, bio, _id } =
      user;
    res.status(200).json({
      firstName,
      lastName,
      emailAddress,
      phoneNumber,
      photo,
      bio,
    });
  } else {
    res.status(400);
    throw new Error('User Not Found');
  }
});

const loginStatus = asyncHandler(async (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.json(false);
  }
  // Verify Token
  const verified = verify(token, process.env.JWT_SECRET);
  if (verified) {
    return res.json(true);
  }
  return res.json(false);
});

const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    res.status(400);
    throw new Error('User Not Found');
  }
  const { firstName, lastName, emailAddress, photo, phoneNumber, bio } = user;
  user.firstName = req.body.firstName || firstName;
  (user.lastName = req.body.lastName || lastName),
    (user.emailAddress = req.body.emailAddress || emailAddress),
    (user.photo = req.body.photo || photo),
    (user.phoneNumber = req.body.phoneNumber || phoneNumber);
  user.bio = req.body.bio || bio;
  const updateUser = await user.save();
  res.status(200).json({
    _id: updatedUser._id,
    name: updatedUser.name,
    emailAddress: updatedUser.emailAddress,
    photo: updatedUser.photo,
    phone: updatedUser.phone,
    bio: updatedUser.bio,
  });
});

const changePassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  const { oldPassword, password } = req.body;

  if (!oldPassword || !password) {
    res.status(400);
    throw new Error('Please Provide the Old and New Password');
  }

  const isPasswordCorrect = await compare(oldPassword, user.password);

  if (user && isPasswordCorrect) {
    user.password = password;
    await user.save();
    res.status(200).send('Password Change Successfully');
  } else {
    res.status(400);
    throw new Error('Old Password is incorrect');
  }
});

const forgetPassword = asyncHandler(async (req, res) => {
  const { emailAddress } = req.body;

  const user = await User.findOne({ emailAddress });

  if (!user) {
    res.status(404);
    throw new Error('User Does Not Exist');
  }

  let token = await Token.findOne({ userId: user._id });
  if (token) {
    await token.deleteOne();
  }

  let resToken = randomBytes(32).toString('hex') + user._id;
  console.log('Reset Password Token', resToken);

  const hashedToken = createHash('sha256').update(resToken).digest('hex');

  await Token.create({
    userId: user._id,
    token: hashedToken,
    createdAt: Date.now(),
    updatedAt: Date.now() + 30 * (60 * 1000),
  });

  const resetUrl = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`;

  const message = `
  <h2>Hello ${user.name}</h2>
      <p>Please use the url below to reset your password</p>  
      <p>This reset link is valid for only 30minutes.</p>
      <a href=${resetUrl} clicktracking=off>${resetUrl}</a>
      <p>Regards...</p>
      <p>Pinvent Team</p>`;

  const subject = 'Forget Password Reset Token';
  const send_from = process.env.EMAIL_USER;
  const send_to = user.emailAddress;

  try {
    await sendMail(subject, message, send_to, send_from);
    res.status(200).json({
      success: true,
      message: 'Password Reset Link has been send to your email',
    });
  } catch (error) {
    res.status(500);
    throw new Error('Unable to send Email, Try again Later');
  }
});

const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const { resetToken } = req.params;

  const hashedToken = createHash('sha256').update(resetToken).digest('hex');

  const userToken = await Token.findOne({
    token: hashedToken,
    expiresAt: { $gt: Date.now() },
  });

  if (!userToken) {
    res.status(404);
    throw new Error('Invalid or Expired Token');
  }

  const user = await User.findOne({ _id: userToken.userId });
  user.password = password;
  await user.save();
  res.status(200).json({
    message: 'Password Reset Successful, Please Login',
  });
});

export {
  registerUser,
  loginStatus,
  loginUser,
  logOut,
  getUser,
  changePassword,
  forgetPassword,
  resetPassword,
  updateUser,
};
