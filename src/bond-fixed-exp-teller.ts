import {
  AuthorityUpdated,
  Bonded,
  ERC20BondTokenCreated,
  OwnerUpdated,
} from "../generated/BondFixedExpTeller/BondFixedExpTeller"
import {BondPurchase, Erc20BondToken} from "../generated/schema";
import {dataSource} from "@graphprotocol/graph-ts";

export function handleAuthorityUpdated(event: AuthorityUpdated): void {
}

export function handleBonded(event: Bonded): void {
  let bondPurchase = BondPurchase.load(event.transaction.hash);

  if (!bondPurchase) {
    bondPurchase = new BondPurchase(event.transaction.hash);
  }

  bondPurchase.marketId = event.params.id;
  bondPurchase.amount = event.params.amount;
  bondPurchase.payout = event.params.payout;
  bondPurchase.recipient = event.transaction.from;
  bondPurchase.referrer = event.params.referrer;
  bondPurchase.timestamp = event.block.timestamp;

  bondPurchase.save();
}

export function handleERC20BondTokenCreated(event: ERC20BondTokenCreated): void {
  let bondToken = new Erc20BondToken(event.transaction.hash);
  bondToken.bondToken = event.params.bondToken;
  bondToken.underlying = event.params.underlying;
  bondToken.expiry = event.params.expiry;
  bondToken.owner = event.transaction.from;
  bondToken.teller = event.address;
  bondToken.network = dataSource.network();

  bondToken.save();
}

export function handleOwnerUpdated(event: OwnerUpdated): void {
}
