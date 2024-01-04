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
      nftAddress: result.nftAddress.toString(),
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

const getStorageDetails = catchAsync(async (req, res)=> {
  const getStorageDetails = await pointInstance.methods.getStorageDetails(req.query.storageId.toString()).call();

  res.status(httpStatus.OK).send({
    status: true,
    data: {
      nftAddress : getStorageDetails.nftAddress,
      account : getStorageDetails.account,
      tokenId : Number(getStorageDetails.tokenId),
      storageEpoch : Number(getStorageDetails.storageEpoch),
      isCollected : getStorageDetails.isCollected,   
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
  const userStoredContains = await pointInstance.methods.userStoredContains(req.query.account.toString(),req.query.storageId.toString()).call();

  res.status(httpStatus.OK).send({
    status: true,
    data: {
      userStoredContains: userStoredContains
    },
  });
});

const userStoredToken = catchAsync(async (req, res)=> {
  const userStoredAllTokenId = await pointInstance.methods.userStoredToken(req.query.account.toString()).call();
  const numberArrayWithParseInt = userStoredAllTokenId.map(bigNum => parseInt(bigNum));

  res.status(httpStatus.OK).send({
    status: true,
    data: {
      userStoredAllTokenId: numberArrayWithParseInt,
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
        message: "MemberShip cannot be less than one"
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

  console.log("userInfo.memberShipEpoch", Number(userInfo.memberShipEpoch) );
  if(Number(userInfo.memberShipEpoch) == 0) {
    return res.status(httpStatus.BAD_REQUEST).send({
      status: false,
      data: {
        estimateGas: 0,
        message: "Must be enrolled any one of the plans"
      },
    });
  }

  if(Number(userInfo.memberShip) != 1) {
    return res.status(httpStatus.BAD_REQUEST).send({
      status: false,
      data: {
        estimateGas: 0,
        message: "Only Premium Membership users can access this"
      },
    });
  }

  let ownerOf;
  let nftInstance = new currentWeb3.eth.Contract(whiskyNftAbi, req.query.nftAddress.toString());

  try {
    ownerOf = await nftInstance.methods.ownerOf(req.query.tokenId.toString()).call();
  } catch(e) {
    return res.status(httpStatus.BAD_REQUEST).send({
      status: false,
      data: {
        estimateGas: 0,
        message: "nonexistent token"
      },
    })
  }

  if(ownerOf.toString() != req.query.senderWallet.toString()) {
     return res.status(httpStatus.BAD_REQUEST).send({
       status: false,
       data: {
         estimateGas: 0,
         message: "Only the owner of the token can access this"
       },
     })
  }

  const isApprovedForAll = await nftInstance.methods.isApprovedForAll(req.query.senderWallet.toString(),contract.whiskyPoint).call();
  const getApproved = await nftInstance.methods.getApproved(req.query.tokenId.toString()).call();
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

  const estimateGas = await pointInstance.methods.enrollLoyalty(req.query.nftAddress.toString(),req.query.tokenId.toString()).estimateGas({
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

  let ownerOf;
  let nftInstance = new currentWeb3.eth.Contract(whiskyNftAbi, req.query.nftAddress.toString());

  try {
    ownerOf = await nftInstance.methods.ownerOf(req.query.tokenId.toString()).call();
  } catch(e) {
    return res.status(httpStatus.BAD_REQUEST).send({
      status: false,
      data: {
        estimateGas: 0,
        message: "nonexistent token"
      },
    })
  }

  if(ownerOf.toString() != req.query.senderWallet.toString()) {
     return res.status(httpStatus.BAD_REQUEST).send({
       status: false,
       data: {
         estimateGas: 0,
         message: "Only the owner of the token can access this"
       },
     })
  }

  const isApprovedForAll = await nftInstance.methods.isApprovedForAll(req.query.senderWallet.toString(),contract.whiskyPoint).call();
  const getApproved = await nftInstance.methods.getApproved(req.query.tokenId.toString()).call();
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

  const estimateGas = await pointInstance.methods.nftStore(req.query.nftAddress.toString(),req.query.tokenId.toString()).estimateGas({
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
  const storageIds = JSON.parse(req.query.storageIds);

  console.log("storageIds",storageIds);
  console.log("storageIds.length",storageIds.length);
  for(let i=0; i<storageIds.length; i++) {
    console.log("iteration", storageIds[i]);
    const getStorageDetails = await pointInstance.methods.getStorageDetails(storageIds[i]).call();
    const userStoredContains = await pointInstance.methods.userStoredContains(req.query.senderWallet.toString(),storageIds[i]).call();

    if(!userStoredContains) {
      return res.status(httpStatus.BAD_REQUEST).send({
        status: false,
        data: {
          message: "User does not have this NFT token Id"
        },
      });
    }

    if(Number(getStorageDetails.storageEpoch) == 0) {
      return res.status(httpStatus.BAD_REQUEST).send({
        status: false,
        data: {
          estimateGas: 0,
          message: "Nft Not Stored"
        },
      })
    }

    if(getStorageDetails.account.toString() != req.query.senderWallet.toString()) {
      return res.status(httpStatus.BAD_REQUEST).send({
        status: false,
        data: {
          message: "Sender wallet is invalid. Please try again"
        },
      });
    }

    if(getStorageDetails.isCollected) {
      return res.status(httpStatus.BAD_REQUEST).send({
        status: false,
        data: {
          message: "Already collected"
        },
      });
    }
  }

  const estimateGas = await pointInstance.methods.collectStoredNft(JSON.parse(req.query.storageIds)).estimateGas({
    from: req.query.senderWallet.toString()
  });

  console.log("estimateGas",estimateGas);

  res.status(httpStatus.OK).send({
    status: true,
    data: {
      estimateGas: Number(estimateGas),
      message: "collectStoredNft successfully"
    },
  });
});

const getStoragePayAmount = catchAsync(async (req, res)=> {
  const userInfo = await pointInstance.methods.getUserInfo(req.query.senderWallet.toString()).call();
  const userStoredContains = await pointInstance.methods.userStoredContains(req.query.senderWallet.toString(),req.query.storageId.toString()).call();
  const getPlatformFees = await pointInstance.methods.getPlatformFees(Number(userInfo.memberShip)).call();
  const getStorageDetails = await pointInstance.methods.getStorageDetails(req.query.storageId.toString()).call();

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

  if(Number(getStorageDetails.storageEpoch) == 0) {
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
  
  let memberShipEpoch = Number(getStorageDetails.storageEpoch);
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
  const userStoredContains = await pointInstance.methods.userStoredContains(req.query.senderWallet.toString(),req.query.storageId.toString()).call();
  const getPlatformFees = await pointInstance.methods.getPlatformFees(Number(userInfo.memberShip)).call();
  const getStorageDetails = await pointInstance.methods.getStorageDetails(req.query.storageId.toString()).call();

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

  if(Number(getStorageDetails.storageEpoch) == 0) {
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
  
  let memberShipEpoch = Number(getStorageDetails.storageEpoch);

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

  const estimateGas = await pointInstance.methods.storagePay(req.query.storageId.toString()).estimateGas({
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
  getStorageDetails,
  getUserMembership,
  getUserInfo,
  getTransactionFeeByUser,
  getReferralFeeDetails,
  getPlatformFees,
  getLoyaltyDetails,
};
