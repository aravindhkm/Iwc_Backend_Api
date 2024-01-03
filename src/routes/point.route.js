import express  from 'express';
import {validate}  from '../middlewares/validate.js';
import pointValidation  from '../validations/point.validation.js';
import pointController  from '../controllers/point.controller.js';

const router = express.Router();

// read method
router.get('/getLoyaltyDetails', validate(pointValidation.accountParams), pointController.getLoyaltyDetails);
router.get('/getPlatformFees', validate(pointValidation.getPlatformFees), pointController.getPlatformFees);
router.get('/getReferralFeeDetails', validate(pointValidation.accountParams), pointController.getReferralFeeDetails);
router.get('/getTransactionFeeByUser', validate(pointValidation.accountParams), pointController.getTransactionFeeByUser);
router.get('/getUserInfo', validate(pointValidation.accountParams), pointController.getUserInfo);
router.get('/getUserMembership', validate(pointValidation.accountParams), pointController.getUserMembership);
router.get('/getStorageDetails', validate(pointValidation.getStorageDetails), pointController.getStorageDetails);
router.get('/getUserTransactionFee', validate(pointValidation.accountParams), pointController.getUserTransactionFee);
router.get('/loyaltyDetails', pointController.loyaltyDetails);
router.get('/userStoredTokenIdStatus', validate(pointValidation.getStorageDetails), pointController.userStoredContains);
router.get('/userStoredAllTokenId', validate(pointValidation.accountParams), pointController.userStoredToken);
router.get('/userStoredTokenlength', validate(pointValidation.accountParams), pointController.userStoredTokenlength);

// write method
router.get('/beforeEnrollMemberShip', validate(pointValidation.enrollMemberShip), pointController.enrollMemberShip);
router.get('/beforeEnrollLoyalty', validate(pointValidation.enrollLoyalty), pointController.enrollLoyalty);
router.get('/beforeNftStore', validate(pointValidation.nftStore), pointController.nftStore);
router.get('/beforeMemberShipPay', validate(pointValidation.senderWallet), pointController.memberShipPay);
router.get('/getMemberShipPayAmount', validate(pointValidation.senderWallet), pointController.getMemberShipPayAmount);
router.get('/beforeCollectStoredNft', validate(pointValidation.collectStoredNft), pointController.collectStoredNft);
router.get('/beforeStoragePay', validate(pointValidation.storagePay), pointController.storagePay);
router.get('/getStoragePayAmount', validate(pointValidation.storagePay), pointController.getStoragePayAmount);
router.get('/beforeCollectPoint', validate(pointValidation.senderWallet), pointController.collectPoint);
router.get('/beforeCollectLoyaltyToken', validate(pointValidation.senderWallet), pointController.collectLoyaltyToken);


export default router;