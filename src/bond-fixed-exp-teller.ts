import {
  AuthorityUpdated,
  Bonded,
  ERC20BondTokenCreated,
  OwnerUpdated,
} from "../generated/BondFixedExpTeller/BondFixedExpTeller"
import {BondPurchase} from "../generated/schema";

export function handleAuthorityUpdated(event: AuthorityUpdated): void {
}

export function handleBonded(event: Bonded): void {
  let bondPurchase = BondPurchase.load(event.transaction.hash);

  if (!bondPurchase) {
    bondPurchase = new BondPurchase(event.transaction.hash);
    bondPurchase.tokenId = event.params.id;
  }

  bondPurchase.amount = event.params.amount;
  bondPurchase.payout = event.params.payout;
  bondPurchase.referrer = event.params.referrer.toHexString();

  bondPurchase.save();
}

export function handleERC20BondTokenCreated(event: ERC20BondTokenCreated): void {
}

export function handleOwnerUpdated(event: OwnerUpdated): void {
}
