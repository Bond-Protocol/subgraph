import { Address } from "@graphprotocol/graph-ts";
import { Pair, Token } from "../../generated/schema";
import { DodoLpAbi } from "../../generated/templates/DodoLpAbi/DodoLpAbi";
import { addPair } from "./pair-common";

export function isDodoLpCompatible(address: Address): boolean {
  let contract = DodoLpAbi.bind(address);
  let res = contract.try_getVaultReserve();
  return res.reverted === false;
}

export function loadOrAddDodoLpCompatiblePair(parentToken: Token): Pair {
  let pair = new Pair(parentToken.address);

  if (!pair) {
    let pairContract = DodoLpAbi.bind(Address.fromString(parentToken.address));
    return addPair(
      parentToken,
      pairContract._BASE_TOKEN_(),
      pairContract._QUOTE_TOKEN_(),
      "DodoLpCompatible"
    );
  }

  return pair;
}
