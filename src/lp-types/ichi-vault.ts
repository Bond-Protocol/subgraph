import {Address} from "@graphprotocol/graph-ts";
import {Pair, Token} from "../../generated/schema";
import {ICHIVault} from "../../generated/templates/ICHIVault/ICHIVault";
import {addPair} from "./pair-common";

export function isICHIVault(address: Address): boolean {
  let contract = ICHIVault.bind(address);
  let res = contract.try_getTotalAmounts();
  return res.reverted === false;
}

export function loadOrAddICHIVaultPair(parentToken: Token): Pair {
  let pair = new Pair(parentToken.address);

  if (!pair) {
    let pairContract = ICHIVault.bind(Address.fromString(parentToken.address));
    return addPair(
      parentToken,
      pairContract.token0(),
      pairContract.token1(),
      "ICHIVault"
    );
  }

  return pair;
}
