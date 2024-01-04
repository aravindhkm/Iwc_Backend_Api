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

const getStorageDetails = Joi.object().keys({
  query: Joi.object().keys({
    account: Joi.string().required(),
    storageId: Joi.string().required(),
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
    nftAddress: Joi.string().required(),
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
    storageId: Joi.string().required(),
    senderWallet: Joi.string().required(),
  }),
});

const collectStoredNft = Joi.object().keys({
  query: Joi.object().keys({
    senderWallet: Joi.string().required(),
    storageIds: Joi.array().items(Joi.number()),
  }),
});

const nftStore = Joi.object().keys({
  query: Joi.object().keys({
    nftAddress: Joi.string().required(),
    tokenId: Joi.string().required(),
    senderWallet: Joi.string().required(),
  }),
});

export default {
  nftStore,
  storagePay,
  collectStoredNft,
  senderWallet,
  enrollLoyalty,
  enrollMemberShip,
  getPlatformFees,
  accountParams,
  getStorageDetails,
}