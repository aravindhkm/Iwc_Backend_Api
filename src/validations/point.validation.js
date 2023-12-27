import Joi  from 'joi';

const accountParams = Joi.object().keys({
  query: Joi.object().keys({
    account: Joi.string().required(),
  }),
})

const getPlatformFees = Joi.object().keys({
  query: Joi.object().keys({
    fee: Joi.string().required(),
  }),
})

const getUserStorageTokenEpoch = Joi.object().keys({
  query: Joi.object().keys({
    account: Joi.string().required(),
    tokenId: Joi.string().required(),
  }),
})

const enrollMemberShip = Joi.object().keys({
  query: Joi.object().keys({
    memberShip: Joi.number().required(),
    referral: Joi.string().required(),
    senderWallet: Joi.string().required(),
  }),
})

const enrollLoyalty = Joi.object().keys({
  query: Joi.object().keys({
    tokenId: Joi.string().required(),
    senderWallet: Joi.string().required(),
  }),
})

const senderWallet = Joi.object().keys({
  query: Joi.object().keys({
    senderWallet: Joi.string().required(),
  }),
});

const storagePay = Joi.object().keys({
  query: Joi.object().keys({
    tokenId: Joi.string().required(),
    senderWallet: Joi.string().required(),
  }),
});

const collectStoredNft = Joi.object().keys({
  query: Joi.object().keys({
    senderWallet: Joi.string().required(),
    tokenIds: Joi.array().items(Joi.number()),
  }),
});

export default {
  storagePay,
  collectStoredNft,
  senderWallet,
  enrollLoyalty,
  enrollMemberShip,
  getPlatformFees,
  accountParams,
  getUserStorageTokenEpoch,
}