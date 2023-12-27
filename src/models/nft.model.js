import mongoose  from 'mongoose';
import validator  from 'validator';
import bcrypt  from 'bcryptjs';
import {toJSON} from './plugins/toJSON.plugin.js';
import { paginate }  from './plugins/paginate.plugin.js';
import { roles }  from '../config/roles.js';

const nftSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error('Invalid email');
        }
      },
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 8,
      validate(value) {
        if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
          throw new Error('Password must contain at least one letter and one number');
        }
      },
      private: true, // used by the toJSON plugin
    },
    role: {
      type: String,
      enum: roles,
      default: 'nft',
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
nftSchema.plugin(toJSON);
nftSchema.plugin(paginate);

/**
 * Check if email is taken
 * @param {string} email - The nft's email
 * @param {ObjectId} [excludeNftId] - The id of the nft to be excluded
 * @returns {Promise<boolean>}
 */
nftSchema.statics.isEmailTaken = async function (email, excludeNftId) {
  const nft = await this.findOne({ email, _id: { $ne: excludeNftId } });
  return !!nft;
};

/**
 * Check if password matches the nft's password
 * @param {string} password
 * @returns {Promise<boolean>}
 */
nftSchema.methods.isPasswordMatch = async function (password) {
  const nft = this;
  return bcrypt.compare(password, nft.password);
};

nftSchema.pre('save', async function (next) {
  const nft = this;
  if (nft.isModified('password')) {
    nft.password = await bcrypt.hash(nft.password, 8);
  }
  next();
});

/**
 * @typedef Nft
 */
export const Nft = mongoose.model('Nft', nftSchema);
