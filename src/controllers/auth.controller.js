import httpStatus  from 'http-status';
import catchAsync  from '../utils/catchAsync';
import { authService, userService, tokenService }  from '../services';

export const register = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  // const tokens = await tokenService.generateAuthTokens(user);
  res.status(httpStatus.CREATED).send({ user });
});

export const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const user = await authService.loginUserWithEmailAndPassword(email, password);
  // const tokens = await tokenService.generateAuthTokens(user);
  res.send({ user });
});

export const logout = catchAsync(async (req, res) => {
  await authService.logout(req.body.refreshToken);
  res.status(httpStatus.OK).send();
});

export const refreshTokens = catchAsync(async (req, res) => {
  const tokens = await authService.refreshAuth(req.body.refreshToken);
  res.send({ ...tokens });
});

export const forgotPassword = catchAsync(async (req, res) => {
  const resetPasswordToken = await tokenService.generateResetPasswordToken(req.body.email);
  // await emailService.sendResetPasswordEmail(req.body.email, resetPasswordToken);
  res.status(httpStatus.OK).send();
});

export const resetPassword = catchAsync(async (req, res) => {
  await authService.resetPassword(req.query.mail, req.body.oldPassword, req.body.newPassword);
  res.status(httpStatus.OK).send({"status": true});
});

export const sendVerificationEmail = catchAsync(async (req, res) => {
  const verifyEmailToken = await tokenService.generateVerifyEmailToken(req.user);
  // await emailService.sendVerificationEmail(req.user.email, verifyEmailToken);
  res.status(httpStatus.NO_CONTENT).send();
});

// const verifyEmail = catchAsync(async (req, res) => {
//   await authService.verifyEmail(req.query.token);
//   res.status(httpStatus.NO_CONTENT).send();
// });
