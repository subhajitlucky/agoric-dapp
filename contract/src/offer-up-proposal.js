// @ts-check
import { E } from '@endo/far';
import { makeMarshal } from '@endo/marshal';
import { AmountMath } from '@agoric/ertp/src/amountMath.js';

console.warn('start proposal module evaluating');

const { Fail } = assert;

// vstorage paths under published.*
const BOARD_AUX = 'boardAux';

const marshalData = makeMarshal(_val => Fail`data only`);

const IST_UNIT = 1_000_000n;
const CENT = IST_UNIT / 100n;

/**
 * @import {ERef} from '@endo/far';
 * @import {StorageNode} from '@agoric/internal/src/lib-chainStorage.js';
 * @import {BootstrapManifest} from '@agoric/vats/src/core/lib-boot.js';
 */

/**
 * Make a storage node for auxiliary data for a value on the board.
 *
 * @param {ERef<StorageNode>} chainStorage
 * @param {string} boardId
 */
const makeBoardAuxNode = async (chainStorage, boardId) => {
  const boardAux = E(chainStorage).makeChildNode(BOARD_AUX);
  return E(boardAux).makeChildNode(boardId);
};

const publishBrandInfo = async (chainStorage, board, brand) => {
  const [id, displayInfo] = await Promise.all([
    E(board).getId(brand),
    E(brand).getDisplayInfo(),
  ]);
  const node = makeBoardAuxNode(chainStorage, id);
  const aux = marshalData.toCapData(harden({ displayInfo }));
  await E(node).setValue(JSON.stringify(aux));
};

// TODO get these from agoric-sdk
/** @typedef {Record<string, any>} BootstrapPowers */

/**
 *
 * Core eval script to start contract
 *
 * @param {BootstrapPowers} permittedPowers
 */
export const startDonationContract = async permittedPowers => {
  console.error('startDonationContract()...');
  const {
    consume: { board, chainStorage, startUpgradable, zoe },
    brand: {
      consume: { IST: istBrandP },
      produce: { Donation: produceDonationBrand },
    },
    issuer: {
      consume: { IST: istIssuerP },
      produce: { Donation: produceDonationIssuer },
    },
    installation: {
      consume: { offerUp: offerUpInstallationP },
    },
    instance: {
      produce: { offerUp: produceInstance },
    },
  } = permittedPowers;

  const istIssuer = await istIssuerP;
  const istBrand = await istBrandP;

  const terms = { donationPrice: AmountMath.make(istBrand, 25n * CENT) };

  const installation = await offerUpInstallationP;

  const { instance } = await E(startUpgradable)({
    installation,
    issuerKeywordRecord: { Price: istIssuer },
    label: 'donation',
    terms,
  });
  console.log('CoreEval script: started contract', instance);
  const {
    brands: { Donation: brand },
    issuers: { Donation: issuer },
  } = await E(zoe).getTerms(instance);

  console.log('CoreEval script: share via agoricNames:', brand);

  produceInstance.reset();
  produceInstance.resolve(instance);

  produceDonationBrand.reset();
  produceDonationIssuer.reset();
  produceDonationBrand.resolve(brand);
  produceDonationIssuer.resolve(issuer);

  await publishBrandInfo(chainStorage, board, brand);
  console.log('donation (re)started');
};

/** @type {BootstrapManifest} */
const offerUpManifest = {
  [startDonationContract.name]: {
    consume: {
      agoricNames: true,
      board: true, // to publish boardAux info for NFT brand
      chainStorage: true, // to publish boardAux info for NFT brand
      startUpgradable: true, // to start contract and save adminFacet
      zoe: true, // to get contract terms, including issuer/brand
    },
    installation: { consume: { offerUp: true } },
    issuer: { consume: { IST: true }, produce: { Donation: true } },
    brand: { consume: { IST: true }, produce: { Donation: true } },
    instance: { produce: { offerUp: true } },
  },
};
harden(offerUpManifest);

export const getManifestForOfferUp = ({ restoreRef }, { offerUpRef }) => {
  return harden({
    manifest: offerUpManifest,
    installations: {
      offerUp: restoreRef(offerUpRef),
    },
  });
};