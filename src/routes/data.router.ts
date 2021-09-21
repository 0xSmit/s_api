import Debug from 'debug';
import { Request, Response, Router } from 'express';
import Web3 from 'web3';
import config from 'config';
import { MultiCall } from 'eth-multicall';
import addressBook from '../constants';
import { erc20ABI } from '../common/abi';
import { AbiItem } from 'web3-utils';
import BN from 'bignumber.js';
const debug = Debug('app:routes:data');

// * ======== Variables ======== * //
const router = Router();
const web3 = {
  polygon: new Web3(config.get('Rpc.polygon')),
  avax: new Web3(config.get('Rpc.avax')),
};

const multicall = {
  polygon: new MultiCall(web3.polygon, addressBook.polygon.multicall),
  avax: new MultiCall(web3.avax, addressBook.avax.multicall),
};

const tokens = {
  polygon: new web3.polygon.eth.Contract(erc20ABI as AbiItem[], addressBook.polygon.token),
  avax: new web3.avax.eth.Contract(erc20ABI as AbiItem[], addressBook.avax.token),
};

// * ======== Controllers ======== * //
router.get('/', async (req: Request, res: Response) => {
  try {
    const polyCalls = [
      {
        totalSupply: tokens.polygon.methods.totalSupply(),
        burned: tokens.polygon.methods.balanceOf(addressBook.polygon.burn),
      },
    ];
    const avaxCalls = [
      {
        totalSupply: tokens.avax.methods.totalSupply(),
        burned: tokens.avax.methods.balanceOf(addressBook.avax.burn),
      },
    ];

    const calls = [multicall.polygon.all([polyCalls]), multicall.avax.all([avaxCalls])];
    const [[[poly]], [[avax]]] = await Promise.all(calls);

    const circulatingSupply = new BN(0).plus(poly.totalSupply).minus(poly.burned).toFixed();

    //No need to add avax burned tokens as they are burned-bridge-redeemed tokens
    const burned = new BN(poly.burned).toFixed();
    const data = {
      tokenname: 'POLYGAJ',
      symbol: 'GAJ',
      address: { polygon: addressBook.polygon.token, avax: addressBook.avax.token },
      raw: {
        totalBurned: burned,
        circulatingSupply,
        totalSupply: circulatingSupply,
        maxSupply: circulatingSupply,
        burned: { polygon: poly.burned, avax: avax.burned },
      },
      sanitized: {
        totalBurned: sanitizeDecimals(burned),
        circulatingSupply: sanitizeDecimals(circulatingSupply),
        totalSupply: sanitizeDecimals(circulatingSupply),
        maxSupply: sanitizeDecimals(circulatingSupply),
        burned: { polygon: sanitizeDecimals(poly.burned), avax: sanitizeDecimals(avax.burned) },
      },
    };

    res.send(data);
  } catch (error: any) {
    debug(error.message);
  }
});

// * ======== Functions ======== * //
function sanitizeDecimals(value: Number | String, decimals: Number | String = 18): String {
  return new BN(value as string).div(new BN(10).pow(decimals as number)).toFixed();
}

export default router;
