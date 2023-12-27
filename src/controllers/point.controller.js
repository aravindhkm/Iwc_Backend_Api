import httpStatus from 'http-status';
import { Web3 } from 'web3';
import {catchAsync} from '../utils/catchAsync.js';
import config from '../config/config.js';
import {contract} from '../config/contract.js';
import {usdcAbi} from '../config/abi/usdcAbi.js';
import {whiskyPointAbi} from '../config/abi/whiskyPointAbi.js';
import {whiskyNftAbi} from '../config/abi/whiskyNftAbi.js';

const currentWeb3 = new Web3(new Web3.providers.HttpProvider(config.rpcUrl));
const usdcInstance = new currentWeb3.eth.Contract(usdcAbi, contract.usdc);
const pointInstance = new currentWeb3.eth.Contract(whiskyPointAbi, contract.whiskyPoint);
const whiskyNftInstance = new currentWeb3.eth.Contract(whiskyNftAbi, contract.whiskyNft);
const zeroAddress = "0x0000000000000000000000000000000000000000";
const duration = 2592000;

const getLoyaltyDetails = catchAsync(async (req, res)=> {
  const result = await pointInstance.methods.getLoyaltyDetails(req.query.account.toString()).call();

  res.status(httpStatus.OK).send({
    status: true,
    data: {
      tokenId: Number(result.tokenId),
      loyaltyEpoch: Number(result.loyaltyEpoch),
      status: result.status
    },
  });
});


const getPlatformFees = catchAsync(async (req, res)=> {
  const result = await pointInstance.methods.getPlatformFees(req.query.fee.toString()).call();

  res.status(httpStatus.OK).send({
    status: true,
    data: {
      accessFee: Number(result.accessFee),
      accessFeesInUSD: (Number(result.accessFee)/1e6) + " USD",
      transactionFee: Number(result.transactionFee),
      referralFee: Number(result.referralFee),
      storageFee: Number(result.storageFee),
      storageEpoch: Number(result.storageEpoch),
    },
  });
});

const getReferralFeeDetails = catchAsync(async (req, res)=> {
  const result = await pointInstance.methods.getReferralFeeDetails(req.query.account.toString()).call();

  res.status(httpStatus.OK).send({
    status: true,
    data: {
      referral: result.referral.toString(),
      fee: Number(result.fee),
    },
  });
});


const getTransactionFeeByUser = catchAsync(async (req, res)=> {
  const result = await pointInstance.methods.getTransactionFeeByUser(req.query.account.toString()).call();
  const userInfo = await pointInstance.methods.getUserInfo(req.query.account.toString()).call();

  res.status(httpStatus.OK).send({
    status: true,
    data: {
      transactionFee: (Number(userInfo.memberShipEpoch) == 0) ? 0 : Number(result),
    },
  });
});

const getUserInfo = catchAsync(async (req, res)=> {
  const userInfo = await pointInstance.methods.getUserInfo(req.query.account.toString()).call();

  res.status(httpStatus.OK).send({
    status: true,
    data: {
        memberShip: Number(userInfo.memberShip),
        holdingPoint: Number(userInfo.holdingPoint),
        memberShipEpoch: Number(userInfo.memberShipEpoch),
        storageEpoch: Number(userInfo.storageEpoch),
        referredBy: userInfo.referredBy,
        referralStatus: userInfo.referralStatus,
    },
  });
});

const getUserMembership = catchAsync(async (req, res)=> {
  const getUserMembership = await pointInstance.methods.getUserMembership(req.query.account.toString()).call();

  res.status(httpStatus.OK).send({
    status: true,
    data: {
      isMembership: getUserMembership,
    },
  });
});

const getUserStorageTokenEpoch = catchAsync(async (req, res)=> {
  const getUserStorageTokenEpoch = await pointInstance.methods.getUserStorageTokenEpoch(req.query.account.toString(),req.query.tokenId.toString()).call();

  res.status(httpStatus.OK).send({
    status: true,
    data: {
      getUserStorageTokenEpoch: Number(getUserStorageTokenEpoch),
    },
  });
});

const getUserTransactionFee = catchAsync(async (req, res)=> {
  const getUserTransactionFee = await pointInstance.methods.getUserTransactionFee(req.query.account.toString()).call();

  res.status(httpStatus.OK).send({
    status: true,
    data: {
      fee: Number(getUserTransactionFee.fee),
      isEnroll: getUserTransactionFee.isEnroll,
    },
  });
});

const loyaltyDetails = catchAsync(async (req, res)=> {
  const loyaltyHoldingDuration = await pointInstance.methods.loyaltyHoldingDuration().call();
  const loyaltyHoldingPoint = await pointInstance.methods.loyaltyHoldingPoint().call();

  res.status(httpStatus.OK).send({
    status: true,
    data: {
      loyaltyHoldingDuration: Number(loyaltyHoldingDuration),
      loyaltyHoldingPoint: Number(loyaltyHoldingPoint),
    },
  });
});

const userStoredContains = catchAsync(async (req, res)=> {
  const userStoredContains = await pointInstance.methods.userStoredContains(req.query.account.toString(),req.query.tokenId.toString()).call();

  res.status(httpStatus.OK).send({
    status: true,
    data: {
      userStoredContains: userStoredContains
    },
  });
});

const userStoredToken = catchAsync(async (req, res)=> {
  const userStoredAllTokenId = await pointInstance.methods.userStoredToken(req.query.account.toString()).call();

  res.status(httpStatus.OK).send({
    status: true,
    data: {
      userStoredAllTokenId: userStoredAllTokenId,
    },
  });
});

const userStoredTokenlength = catchAsync(async (req, res)=> {
  const userStoredTokenlength = await pointInstance.methods.userStoredTokenlength(req.query.account.toString()).call();

  res.status(httpStatus.OK).send({
    status: true,
    data: {
      userStoredTokenlength: Number(userStoredTokenlength),
    },
  });
});

const enrollMemberShip = catchAsync(async (req, res)=> {
  if(zeroAddress == req.query.referral.toString()) {
      return res.status(httpStatus.BAD_REQUEST).send({
        status: false,
        data: {
          estimateGas: 0,
          message: "Account cannot be 0x0000000000000000000000000000000000000000"
        },
      });
  };

  if(req.query.referral.toString() == req.query.senderWallet.toString()) {
    return res.status(httpStatus.BAD_REQUEST).send({
      status: false,
      data: {
        estimateGas: 0,
        message: "Referral cannot be sender address"
      },
    });
  };

  const userInfo = await pointInstance.methods.getUserInfo(req.query.referral.toString()).call();

  if(Number(userInfo.memberShipEpoch) == 0) {
    return res.status(httpStatus.BAD_REQUEST).send({
      status: false,
      data: {
        estimateGas: 0,
        message: "Referral address must be enrolled"
      },
    });
  }

  console.log("Received memberShip: " + req.query.memberShip);
  if(Number(req.query.memberShip) > 1) {
    return res.status(httpStatus.BAD_REQUEST).send({
      status: false,
      data: {
        estimateGas: 0,
        message: "MemberShip cannot be greater than one"
      },
    });
  }

  const getPlatformFees = await pointInstance.methods.getPlatformFees(req.query.memberShip).call();

  if(Number(getPlatformFees.accessFee) > 0) {
      const balanceOf = await usdcInstance.methods.balanceOf(req.query.senderWallet.toString()).call();
      const allowance = await usdcInstance.methods.allowance(req.query.senderWallet.toString(),contract.whiskyPoint).call();

      if(Number(getPlatformFees.accessFee) > Number(balanceOf)) {
        return res.status(httpStatus.BAD_REQUEST).send({
          status: false,
          data: {
            estimateGas: 0,
            message: "Insufficient USDC balance"
          },
        });
      }

      if(Number(getPlatformFees.accessFee) > Number(allowance)) {
        return res.status(httpStatus.BAD_REQUEST).send({
          status: false,
          data: {
            estimateGas: 0,
            message: "Insufficient USDC allowance",
            approveParams: {
              spender: contract.whiskyPoint,
              amount: Number(getPlatformFees.accessFee)
            }
          },
        });
      }
  }

  const estimateGas = await pointInstance.methods.enrollMemberShip(req.query.memberShip,req.query.referral.toString()).estimateGas({
    from: req.query.senderWallet.toString()
  });

  res.status(httpStatus.OK).send({
    status: true,
    data: {
      estimateGas: Number(estimateGas),
      message: "Enroll successfully"
    },
  });
});

const enrollLoyalty = catchAsync(async (req, res)=> {

  const userInfo = await pointInstance.methods.getUserInfo(req.query.senderWallet.toString()).call();

  if(Number(userInfo.memberShipEpoch) == 0) {
    return res.status(httpStatus.BAD_REQUEST).send({
      status: false,
      data: {
        estimateGas: 0,
        message: "Must be enrolled any one of the plans"
      },
    });
  }

  if(Number(req.query.memberShip) != 1) {
    return res.status(httpStatus.BAD_REQUEST).send({
      status: false,
      data: {
        estimateGas: 0,
        message: "Only Premium Membership users can access this"
      },
    });
  }

  const ownerOf = await whiskyNftInstance.methods.ownerOf(req.query.tokenId.toString()).call();

  if(ownerOf.toString() != req.query.senderWallet.toString()) {
     return res.status(httpStatus.BAD_REQUEST).send({
       status: false,
       data: {
         estimateGas: 0,
         message: "Only the owner of the token can access this"
       },
     })
  }

  const isApprovedForAll = await whiskyNftInstance.methods.isApprovedForAll(req.query.senderWallet.toString(),contract.whiskyPoint).call();
  const getApproved = await whiskyNftInstance.methods.getApproved(req.query.tokenId.toString()).call();
  if(!isApprovedForAll && (getApproved.toString() != contract.whiskyPoint)) {
    return res.status(httpStatus.BAD_REQUEST).send({
      status: false,
      data: {
        estimateGas: 0,
        message: "Nft Approve error",
        approveParams: {
          spender: contract.whiskyPoint,
          tokenId: req.query.tokenId.toString()
        }
      },
    })
  }

  const estimateGas = await pointInstance.methods.enrollLoyalty(req.query.tokenId.toString()).estimateGas({
    from: req.query.senderWallet.toString()
  });

  res.status(httpStatus.OK).send({
    status: true,
    data: {
      estimateGas: Number(estimateGas),
      message: "EnrollLayalty successfully"
    },
  });
});

const nftStore = catchAsync(async (req, res)=> {

  const userInfo = await pointInstance.methods.getUserInfo(req.query.senderWallet.toString()).call();

  if(Number(userInfo.memberShipEpoch) == 0) {
    return res.status(httpStatus.BAD_REQUEST).send({
      status: false,
      data: {
        estimateGas: 0,
        message: "Must be enrolled any one of the plans"
      },
    });
  }

  const getUserStorageTokenEpoch = await pointInstance.methods.getUserStorageTokenEpoch(req.query.senderWallet.toString(),req.query.tokenId.toString()).call();

  if(Number(getUserStorageTokenEpoch) != 0) {
    return res.status(httpStatus.BAD_REQUEST).send({
      status: false,
      data: {
        estimateGas: 0,
        message: "Nft Already Stored"
      },
    });
  }

  const ownerOf = await whiskyNftInstance.methods.ownerOf(req.query.tokenId.toString()).call();

  if(ownerOf.toString() != req.query.senderWallet.toString()) {
     return res.status(httpStatus.BAD_REQUEST).send({
       status: false,
       data: {
         estimateGas: 0,
         message: "Only the owner of the token can access this"
       },
     })
  }

  const isApprovedForAll = await whiskyNftInstance.methods.isApprovedForAll(req.query.senderWallet.toString(),contract.whiskyPoint).call();
  const getApproved = await whiskyNftInstance.methods.getApproved(req.query.tokenId.toString()).call();
  if(!isApprovedForAll && (getApproved.toString() != contract.whiskyPoint)) {
    return res.status(httpStatus.BAD_REQUEST).send({
      status: false,
      data: {
        estimateGas: 0,
        message: "Nft Approve error",
        approveParams: {
          spender: contract.whiskyPoint,
          tokenId: req.query.tokenId.toString()
        }
      },
    })
  }

  const estimateGas = await pointInstance.methods.nftStore(req.query.tokenId.toString()).estimateGas({
    from: req.query.senderWallet.toString()
  });

  res.status(httpStatus.OK).send({
    status: true,
    data: {
      estimateGas: Number(estimateGas),
      message: "NftStore successfully"
    },
  });
});

const getMemberShipPayAmount = catchAsync(async (req, res)=> {
  const userInfo = await pointInstance.methods.getUserInfo(req.query.senderWallet.toString()).call();
  const getPlatformFees = await pointInstance.methods.getPlatformFees(Number(userInfo.memberShip)).call();
  let memberShipEpoch = Number(userInfo.memberShipEpoch);

  if(memberShipEpoch == 0) {
    return res.status(httpStatus.BAD_REQUEST).send({
      status: false,
      data: {
        amount: 0,
        message: "Must be enrolled any one of the plans"
      },
    });
  }

  if(Number(getPlatformFees.accessFee) == 0) {
    return res.status(httpStatus.OK).send({
      status: true,
      data: {
        amount: 0,
        message: "No Platform Fees"
      },
    });
  }

  const currentEpochTimeSeconds = Math.floor(new Date().getTime() / 1000);
  let totalDuration = 0;
  while(memberShipEpoch + duration <= currentEpochTimeSeconds) {
    memberShipEpoch = memberShipEpoch + duration;
    totalDuration += 1;
  }

  const totalAmountNeedToPay = totalDuration * Number(getPlatformFees.accessFee);

  res.status(httpStatus.OK).send({
    status: true,
    data: {
      monthDuration: totalDuration,
      totalAmountNeedToPay: Number(totalAmountNeedToPay),
      message: "getMemberShipPayAmount successfully"
    },
  });
});

const memberShipPay = catchAsync(async (req, res)=> {
  const userInfo = await pointInstance.methods.getUserInfo(req.query.senderWallet.toString()).call();
  const getPlatformFees = await pointInstance.methods.getPlatformFees(Number(userInfo.memberShip)).call();
  let memberShipEpoch = Number(userInfo.memberShipEpoch);

  if(Number(userInfo.memberShipEpoch) == 0) {
    return res.status(httpStatus.BAD_REQUEST).send({
      status: false,
      data: {
        estimateGas: 0,
        message: "Must be enrolled any one of the plans"
      },
    });
  }

  if(Number(getPlatformFees.accessFee) == 0) {
    return res.status(httpStatus.OK).send({
      status: true,
      data: {
        amount: 0,
        message: "No Platform Fees"
      },
    });
  }
  
  const currentEpochTimeSeconds = Math.floor(new Date().getTime() / 1000);
  let totalDuration = 0;
  while(memberShipEpoch + duration <= currentEpochTimeSeconds) {
    memberShipEpoch = memberShipEpoch + duration;
    totalDuration += 1;
  }

  const totalAmountNeedToPay = totalDuration * Number(getPlatformFees.accessFee);

  if(totalAmountNeedToPay > 0) {
    const balanceOf = await usdcInstance.methods.balanceOf(req.query.senderWallet.toString()).call();
    const allowance = await usdcInstance.methods.allowance(req.query.senderWallet.toString(),contract.whiskyPoint).call();

    if(totalAmountNeedToPay > Number(balanceOf)) {
      return res.status(httpStatus.BAD_REQUEST).send({
        status: false,
        data: {
          estimateGas: 0,
          monthDuration: totalDuration,
          totalAmountNeedToPay: totalAmountNeedToPay,
          message: "Insufficient USDC balance"
        },
      });
    }

    if(totalAmountNeedToPay > Number(allowance)) {
      return res.status(httpStatus.BAD_REQUEST).send({
        status: false,
        data: {
          estimateGas: 0,
          monthDuration: totalDuration,
          totalAmountNeedToPay: totalAmountNeedToPay,
          message: "Insufficient USDC allowance",
          approveParams: {
            spender: contract.whiskyPoint,
            amount: totalAmountNeedToPay
          }
        },
      });
    }
}

  const estimateGas = await pointInstance.methods.memberShipPay().estimateGas({
    from: req.query.senderWallet.toString()
  });

  res.status(httpStatus.OK).send({
    status: true,
    data: {
      estimateGas: Number(estimateGas),
      monthDuration: totalDuration,
      totalAmountNeedToPay: totalAmountNeedToPay,
      message: "EnrollLayalty successfully"
    },
  });
});

const collectStoredNft = catchAsync(async (req, res)=> {
  const tokenIds = JSON.parse(req.query.tokenIds);

  for(let i=0; i<tokenIds.length; i++) {
    console.log("iteration", tokenIds[i]);
    const userStoredToken = await pointInstance.methods.getUserStorageTokenEpoch(req.query.senderWallet.toString(),tokenIds[i]).call();

    if(Number(userStoredToken) == 0) {
      return res.status(httpStatus.BAD_REQUEST).send({
        status: false,
        data: {
          estimateGas: 0,
          message: "Nft Not Stored"
        },
      })
    }
  }

  const estimateGas = await pointInstance.methods.collectStoredNft(req.query.tokenIds.toString()).estimateGas({
    from: req.query.senderWallet.toString()
  });

  res.status(httpStatus.OK).send({
    status: true,
    data: {
      estimateGas: Number(0),
      message: "collectStoredNft successfully"
    },
  });
});

const getStoragePayAmount = catchAsync(async (req, res)=> {
  const userInfo = await pointInstance.methods.getUserInfo(req.query.senderWallet.toString()).call();
  const userStoredContains = await pointInstance.methods.userStoredContains(req.query.senderWallet.toString(),req.query.tokenId.toString()).call();
  const getPlatformFees = await pointInstance.methods.getPlatformFees(Number(userInfo.memberShip)).call();
  const userStoredTokenEpoch = await pointInstance.methods.getUserStorageTokenEpoch(req.query.senderWallet.toString(),req.query.tokenId.toString()).call();

  if(Number(userInfo.memberShipEpoch) == 0) {
    return res.status(httpStatus.BAD_REQUEST).send({
      status: false,
      data: {
        message: "Must be enrolled any one of the plans"
      },
    });
  }

  if(!userStoredContains) {
    return res.status(httpStatus.BAD_REQUEST).send({
      status: false,
      data: {
        message: "User does not have this NFT token Id"
      },
    });
  }

  if(Number(userStoredTokenEpoch) == 0) {
    return res.status(httpStatus.BAD_REQUEST).send({
      status: false,
      data: {
        message: "Nft Not Stored"
      },
    })
  }

  if(Number(getPlatformFees.storageFee) == 0) {
    return res.status(httpStatus.OK).send({
      status: true,
      data: {
        amount: 0,
        message: "No StorageFee Fees"
      },
    });
  }
  
  let memberShipEpoch = Number(userStoredTokenEpoch);

  const currentEpochTimeSeconds = Math.floor(new Date().getTime() / 1000);
  let totalDuration = 0;
  while(memberShipEpoch + duration <= currentEpochTimeSeconds) {
    memberShipEpoch = memberShipEpoch + duration;
    totalDuration += 1;
  }

  const totalAmountNeedToPay = totalDuration * Number(getPlatformFees.storageFee);

  if(totalAmountNeedToPay > 0) {
    const balanceOf = await usdcInstance.methods.balanceOf(req.query.senderWallet.toString()).call();
    const allowance = await usdcInstance.methods.allowance(req.query.senderWallet.toString(),contract.whiskyPoint).call();

    if(totalAmountNeedToPay > Number(balanceOf)) {
      return res.status(httpStatus.BAD_REQUEST).send({
        status: false,
        data: {
          monthDuration: totalDuration,
          totalAmountNeedToPay: totalAmountNeedToPay,
          message: "Insufficient USDC balance"
        },
      });
    }

    if(totalAmountNeedToPay > Number(allowance)) {
      return res.status(httpStatus.BAD_REQUEST).send({
        status: false,
        data: {
          monthDuration: totalDuration,
          totalAmountNeedToPay: totalAmountNeedToPay,
          message: "Insufficient USDC allowance",
          approveParams: {
            spender: contract.whiskyPoint,
            amount: totalAmountNeedToPay
          }
        },
      });
    }
  }

  res.status(httpStatus.OK).send({
    status: true,
    data: {
      monthDuration: totalDuration,
      totalAmountNeedToPay: totalAmountNeedToPay,
      message: "StoragePay successfully"
    },
  });
});

const storagePay = catchAsync(async (req, res)=> {
  const userInfo = await pointInstance.methods.getUserInfo(req.query.senderWallet.toString()).call();
  const userStoredContains = await pointInstance.methods.userStoredContains(req.query.senderWallet.toString(),req.query.tokenId.toString()).call();
  const getPlatformFees = await pointInstance.methods.getPlatformFees(Number(userInfo.memberShip)).call();
  const userStoredTokenEpoch = await pointInstance.methods.getUserStorageTokenEpoch(req.query.senderWallet.toString(),req.query.tokenId.toString()).call();

  if(Number(userInfo.memberShipEpoch) == 0) {
    return res.status(httpStatus.BAD_REQUEST).send({
      status: false,
      data: {
        estimateGas: 0,
        message: "Must be enrolled any one of the plans"
      },
    });
  }

  if(!userStoredContains) {
    return res.status(httpStatus.BAD_REQUEST).send({
      status: false,
      data: {
        estimateGas: 0,
        message: "User does not have this NFT token Id"
      },
    });
  }

  if(Number(userStoredTokenEpoch) == 0) {
    return res.status(httpStatus.BAD_REQUEST).send({
      status: false,
      data: {
        estimateGas: 0,
        message: "Nft Not Stored"
      },
    })
  }

  if(Number(getPlatformFees.storageFee) == 0) {
    return res.status(httpStatus.OK).send({
      status: true,
      data: {
        amount: 0,
        message: "No StorageFee Fees"
      },
    });
  }
  
  let memberShipEpoch = Number(userStoredTokenEpoch);

  const currentEpochTimeSeconds = Math.floor(new Date().getTime() / 1000);
  let totalDuration = 0;
  while(memberShipEpoch + duration <= currentEpochTimeSeconds) {
    memberShipEpoch = memberShipEpoch + duration;
    totalDuration += 1;
  }

  const totalAmountNeedToPay = totalDuration * Number(getPlatformFees.storageFee);

  if(totalAmountNeedToPay > 0) {
    const balanceOf = await usdcInstance.methods.balanceOf(req.query.senderWallet.toString()).call();
    const allowance = await usdcInstance.methods.allowance(req.query.senderWallet.toString(),contract.whiskyPoint).call();

    if(totalAmountNeedToPay > Number(balanceOf)) {
      return res.status(httpStatus.BAD_REQUEST).send({
        status: false,
        data: {
          estimateGas: 0,
          monthDuration: totalDuration,
          totalAmountNeedToPay: totalAmountNeedToPay,
          message: "Insufficient USDC balance"
        },
      });
    }

    if(totalAmountNeedToPay > Number(allowance)) {
      return res.status(httpStatus.BAD_REQUEST).send({
        status: false,
        data: {
          estimateGas: 0,
          monthDuration: totalDuration,
          totalAmountNeedToPay: totalAmountNeedToPay,
          message: "Insufficient USDC allowance",
          approveParams: {
            spender: contract.whiskyPoint,
            amount: totalAmountNeedToPay
          }
        },
      });
    }
  }

  const estimateGas = await pointInstance.methods.storagePay(req.query.tokenId.toString()).estimateGas({
    from: req.query.senderWallet.toString()
  });

  res.status(httpStatus.OK).send({
    status: true,
    data: {
      estimateGas: Number(estimateGas),
      monthDuration: totalDuration,
      totalAmountNeedToPay: totalAmountNeedToPay,
      message: "StoragePay successfully"
    },
  });
});

const collectPoint = catchAsync(async (req, res)=> {
  const getLoyaltyDetails = await pointInstance.methods.getLoyaltyDetails(req.query.senderWallet.toString()).call();
  const userInfo = await pointInstance.methods.getUserInfo(req.query.senderWallet.toString()).call();

  if(Number(userInfo.memberShipEpoch) == 0) {
    return res.status(httpStatus.BAD_REQUEST).send({
      status: false,
      data: {
        estimateGas: 0,
        message: "Must be enrolled any one of the plans"
      },
    });
  }

  if(!getLoyaltyDetails.status) {
    return res.status(httpStatus.BAD_REQUEST).send({
      status: false,
      data: {
        estimateGas: 0,
        message: "Must be enrollLoyalty any one of the tokenId"
      },
    });
  }

  if(getLoyaltyDetails.loyaltyEpoch == 0) {
    return res.status(httpStatus.BAD_REQUEST).send({
      status: false,
      data: {
        estimateGas: 0,
        message: "loyaltyEpoch: Must be enrollLoyalty any one of the tokenId"
      },
    });
  }

  const estimateGas = await pointInstance.methods.collectPoint().estimateGas({
    from: req.query.senderWallet.toString()
  });

  res.status(httpStatus.OK).send({
    status: true,
    data: {
      estimateGas: Number(estimateGas),
      message: "collectStoredNft successfully"
    },
  });
});


const collectLoyaltyToken = catchAsync(async (req, res)=> {
  const getLoyaltyDetails = await pointInstance.methods.getLoyaltyDetails(req.query.senderWallet.toString()).call();
  const userInfo = await pointInstance.methods.getUserInfo(req.query.senderWallet.toString()).call();

  if(Number(userInfo.memberShipEpoch) == 0) {
    return res.status(httpStatus.BAD_REQUEST).send({
      status: false,
      data: {
        estimateGas: 0,
        message: "Must be enrolled any one of the plans"
      },
    });
  }

  if(!getLoyaltyDetails.status) {
    return res.status(httpStatus.BAD_REQUEST).send({
      status: false,
      data: {
        estimateGas: 0,
        message: "Must be enrollLoyalty any one of the tokenId"
      },
    });
  }

  if(getLoyaltyDetails.loyaltyEpoch == 0) {
    return res.status(httpStatus.BAD_REQUEST).send({
      status: false,
      data: {
        estimateGas: 0,
        message: "loyaltyEpoch: Must be enrollLoyalty any one of the tokenId"
      },
    });
  }

  const estimateGas = await pointInstance.methods.collectPoint().estimateGas({
    from: req.query.senderWallet.toString()
  });

  res.status(httpStatus.OK).send({
    status: true,
    data: {
      estimateGas: Number(estimateGas),
      message: "collectStoredNft successfully"
    },
  });
});

export default {
  collectLoyaltyToken,
  collectPoint,
  getStoragePayAmount,
  storagePay,
  collectStoredNft,
  getMemberShipPayAmount,
  memberShipPay,
  nftStore,
  enrollLoyalty,
  enrollMemberShip,
  userStoredTokenlength,
  userStoredToken,
  userStoredContains,
  loyaltyDetails,
  getUserTransactionFee,
  getUserStorageTokenEpoch,
  getUserMembership,
  getUserInfo,
  getTransactionFeeByUser,
  getReferralFeeDetails,
  getPlatformFees,
  getLoyaltyDetails,
};
