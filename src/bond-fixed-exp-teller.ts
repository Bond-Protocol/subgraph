import {
  AuthorityUpdated,
  Bonded,
  ERC20BondTokenCreated,
  OwnerUpdated,
} from "../generated/BondFixedExpTeller/BondFixedExpTeller"
import {dataSource} from "@graphprotocol/graph-ts";
import {ERC20} from "../generated/templates/ERC20/ERC20";
import {BondFixedExpCDA} from "../generated/BondFixedExpCDA/BondFixedExpCDA";
import {createBondPurchase, createBondToken} from "./teller-common";

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
  const bondTokenContract = ERC20.bind(event.params.bondToken);

  createBondToken(
    event.params.bondToken.toHexString(),
    event.params.underlying,
    event.params.expiry,
    event.address,
    dataSource.network(),
    "fixed-expiration",
    bondTokenContract.decimals(),
    bondTokenContract.symbol()
  );
}

export function handleOwnerUpdated(event: OwnerUpdated): void {
}
