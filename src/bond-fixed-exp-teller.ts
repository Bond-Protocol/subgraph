import {
  AuthorityUpdated,
  Bonded,
  ERC20BondTokenCreated,
  OwnerUpdated,
} from "../generated/BondFixedExpTeller/BondFixedExpTeller"
import {BondToken} from "../generated/schema";
import {dataSource} from "@graphprotocol/graph-ts";
import {ERC20} from "../generated/templates/ERC20/ERC20";
import {BondFixedExpCDA} from "../generated/BondFixedExpCDA/BondFixedExpCDA";
import {createBondPurchase} from "./teller-common";

export function handleAuthorityUpdated(event: AuthorityUpdated): void {
}

export function handleBonded(event: Bonded): void {
  createBondPurchase(
    event.params.id,
    event.transaction.hash,
    dataSource.network(),
    "BondFixedExpCDA",
    event.params.amount,
    event.params.payout,
    event.transaction.from,
    event.params.referrer,
    event.block.timestamp
  );
}

export function handleERC20BondTokenCreated(event: ERC20BondTokenCreated): void {
  let bondToken = new BondToken(event.params.bondToken.toHexString());
  let bondTokenContract = ERC20.bind(event.params.bondToken);

  bondToken.decimals = bondTokenContract.decimals();
  bondToken.symbol = bondTokenContract.symbol();
  bondToken.underlying = dataSource.network() + "_" + event.params.underlying.toHexString();
  bondToken.expiry = event.params.expiry;
  bondToken.teller = event.address.toHexString();
  bondToken.network = dataSource.network();
  bondToken.type = "fixed-expiration";

  bondToken.save();
}

export function handleOwnerUpdated(event: OwnerUpdated): void {
}
