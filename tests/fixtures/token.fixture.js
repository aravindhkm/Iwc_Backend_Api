const moment  from 'moment');
const config  from '../../src/config/config');
const { tokenTypes }  from '../../src/config/tokens');
const tokenService  from '../../src/services/token.service');
const { userOne, admin }  from './user.fixture');

const accessTokenExpires = moment().add(config.jwt.accessExpirationMinutes, 'minutes');
const userOneAccessToken = tokenService.generateToken(userOne._id, accessTokenExpires, tokenTypes.ACCESS);
const adminAccessToken = tokenService.generateToken(admin._id, accessTokenExpires, tokenTypes.ACCESS);

module.exports = {
  userOneAccessToken,
  adminAccessToken,
};
