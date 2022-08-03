import {
  AuthorityUpdated,
  Bonded,
  ERC20BondTokenCreated,
  OwnerUpdated,
} from "../generated/BondFixedExpTeller/BondFixedExpTeller"
import {BondPurchase, BondToken} from "../generated/schema";
import {dataSource} from "@graphprotocol/graph-ts";

export function handleAuthorityUpdated(event: AuthorityUpdated): void {
}

export function handleBonded(event: Bonded): void {
  let bondPurchase = BondPurchase.load(event.transaction.hash);

  if (!bondPurchase) {
    bondPurchase = new BondPurchase(event.transaction.hash);
  }

  bondPurchase.marketId = dataSource.network() + "_BondFixedExpCDA_" + event.params.id.toString();
  bondPurchase.amount = event.params.amount;
  bondPurchase.payout = event.params.payout;
  bondPurchase.recipient = event.transaction.from.toHexString();
  bondPurchase.referrer = event.params.referrer.toHexString();
  bondPurchase.timestamp = event.block.timestamp;

  bondPurchase.save();
}

export function handleERC20BondTokenCreated(event: ERC20BondTokenCreated): void {
  let bondToken = new BondToken(event.params.bondToken.toHexString());

  bondToken.underlying = dataSource.network() + "_" + event.params.underlying.toHexString();
  bondToken.expiry = event.params.expiry;
  bondToken.teller = event.address;
  bondToken.network = dataSource.network();
  bondToken.type = "fixed-expiration";

  bondToken.save();
}

export function handleOwnerUpdated(event: OwnerUpdated): void {
}
