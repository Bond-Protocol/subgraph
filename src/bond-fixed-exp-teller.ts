import {
  AuthorityUpdated,
  Bonded,
  ERC20BondTokenCreated,
  OwnerUpdated,
} from "../generated/BondFixedExpTellerAbi/BondFixedExpTellerAbi"
import {ERC20Abi} from "../generated/templates/ERC20Abi/ERC20Abi";
import {createBondPurchase, createBondToken} from "./teller-common";

export function handleAuthorityUpdated(event: AuthorityUpdated): void {
}

export function handleBonded(event: Bonded): void {
  createBondPurchase(
    event.params.id,
    event.transaction.hash,
    "BondFixedExpCDA",
    event.params.amount,
    event.params.payout,
    event.transaction.from,
    event.params.referrer,
    event.block.timestamp
  );
}

export function handleERC20BondTokenCreated(event: ERC20BondTokenCreated): void {
  const bondTokenContract = ERC20Abi.bind(event.params.bondToken);

  createBondToken(
    event.params.bondToken.toHexString(),
    event.params.underlying,
    event.params.expiry,
    event.address,
    "fixed-expiration",
    bondTokenContract.decimals(),
    bondTokenContract.symbol()
  );
}

export function handleOwnerUpdated(event: OwnerUpdated): void {
}
