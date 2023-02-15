import {Address} from "@graphprotocol/graph-ts";
import {Pair, Token} from "../../generated/schema";
import {DodoLp} from "../../generated/templates/DodoLp/DodoLp";
import {addPair} from "./pair-common";

export function isDodoLpToken(address: Address): boolean {
  let contract = DodoLp.bind(address);
  let res = contract.try_getVaultReserve();
  return res.reverted === false;
}

export function loadOrAddDodoLpPair(parentToken: Token): Pair {
  let pair = new Pair(parentToken.address);

  if (!pair) {
    let pairContract = DodoLp.bind(Address.fromString(parentToken.address));
    return addPair(
      parentToken,
      pairContract._BASE_TOKEN_(),
      pairContract._QUOTE_TOKEN_(),
      "DodoLp"
    );
  }

  return pair;
}
