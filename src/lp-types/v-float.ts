import {Address} from "@graphprotocol/graph-ts";
import {Pair, Token} from "../../generated/schema";
import {vFloat} from "../../generated/templates/vFloat/vFloat";
import {addPair} from "./pair-common";

export function isVFloat(address: Address): boolean {
  let contract = vFloat.bind(address);
  let res = contract.try_getTotalAmounts();
  return res.reverted === false;
}

export function loadOrAddVFloatPair(parentToken: Token): Pair {
  let pair = new Pair(parentToken.address);

  if (!pair) {
    let pairContract = vFloat.bind(Address.fromString(parentToken.address));
    return addPair(
      parentToken,
      pairContract.token0(),
      pairContract.token1(),
      "vFloat"
    );
  }

  return pair;
}
