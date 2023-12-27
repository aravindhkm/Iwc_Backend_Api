import httpStatus  from 'http-status';
import { Nft }  from '../models';
import ApiError  from '../utils/ApiError.js';

/**
 * Create a nft
 * @param {Object} userBody
 * @returns {Promise<Nft>}
 */
const createNft = async (userBody) => {
  if (await Nft.isEmailTaken(userBody.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  return Nft.create(userBody);
};

/**
 * Query for users
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryNfts = async (filter, options) => {
  const users = await Nft.paginate(filter, options);
  return users;
};

/**
 * Get nft by id
 * @param {ObjectId} id
 * @returns {Promise<Nft>}
 */
const getNftById = async (id) => {
  return Nft.findById(id);
};

/**
 * Get nft by email
 * @param {string} email
 * @returns {Promise<Nft>}
 */
const getNftByEmail = async (email) => {
  return Nft.findOne({ email });
};

/**
 * Update nft by id
 * @param {ObjectId} userId
 * @param {Object} updateBody
 * @returns {Promise<Nft>}
 */
const updateNftById = async (userId, updateBody) => {
  const nft = await getNftById(userId);
  if (!nft) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Nft not found');
  }
  if (updateBody.email && (await Nft.isEmailTaken(updateBody.email, userId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  Object.assign(nft, updateBody);
  await nft.save();
  return nft;
};

/**
 * Delete nft by id
 * @param {ObjectId} userId
 * @returns {Promise<Nft>}
 */
const deleteNftById = async (userId) => {
  const nft = await getNftById(userId);
  if (!nft) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Nft not found');
  }
  await nft.remove();
  return nft;
};

// module.exports = {
//   createNft,
//   queryNfts,
//   getNftById,
//   getNftByEmail,
//   updateNftById,
//   deleteNftById,
// };
