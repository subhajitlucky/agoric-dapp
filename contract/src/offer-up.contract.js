/**
 * @file Contract to handle donations.
 *
 * @see {@link https://docs.agoric.com/guides/zoe/|Zoe Overview} for a walk-thru of this contract
 * @see {@link https://docs.agoric.com/guides/js-programming/hardened-js.html|Hardened JavaScript}
 * for background on harden and assert.
 */
// @ts-check

import { Far } from '@endo/far';
import { M } from '@endo/patterns';
import { AssetKind } from '@agoric/ertp/src/amountMath.js';
import { AmountShape } from '@agoric/ertp/src/typeGuards.js';
import { atomicRearrange } from '@agoric/zoe/src/contractSupport/atomicTransfer.js';
import '@agoric/zoe/exported.js';

/**
 * @import {Amount} from '@agoric/ertp/src/types.js';
 */
const { Fail, quote: q } = assert;

/**
 * @typedef {{
 *   donationPrice: Amount;
 * }} DonationTerms
 */

export const meta = {
  customTermsShape: M.splitRecord(
    { donationPrice: AmountShape },
  ),
};
harden(meta);
// compatibility with an earlier contract metadata API
export const customTermsShape = meta.customTermsShape;
harden(customTermsShape);

/**
 * Start a contract that handles donations.
 *
 * @param {ZCF<DonationTerms>} zcf
 */
export const start = async zcf => {
  const { donationPrice } = zcf.getTerms();

  /**
   * a pattern to constrain proposals given to {@link donationHandler}
   *
   * The Price amount must be >= donationPrice term.
   */
  const proposalShape = harden({
    give: { Price: M.gte(donationPrice) },
    exit: M.any(),
  });

  /** a seat for allocating proceeds of donations */
  const proceeds = zcf.makeEmptySeatKit().zcfSeat;

  /** @type {OfferHandler} */
  const donationHandler = donorSeat => {
    // give is guaranteed by Zoe to match proposalShape
    const { give } = donorSeat.getProposal();

    atomicRearrange(
      zcf,
      harden([
        // price from donor to proceeds
        [donorSeat, proceeds, { Price: donationPrice }],
      ]),
    );

    donorSeat.exit(true);
    return 'donation complete';
  };

  /**
   * Make an invitation to donate.
   *
   * Proposal Keywords used in offers using these invitations:
   *   - give: Price
   */
  const makeDonationInvitation = () =>
    zcf.makeInvitation(donationHandler, 'donate', undefined, proposalShape);

  // Mark the publicFacet Far, i.e. reachable from outside the contract
  const publicFacet = Far('Donation Public Facet', {
    makeDonationInvitation,
  });
  return harden({ publicFacet });
};
harden(start);