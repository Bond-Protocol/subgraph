import {Address} from "@graphprotocol/graph-ts";
import {Pair, Token} from "../../generated/schema";
import {GUniPool} from "../../generated/templates/GUniPool/GUniPool";
import {addPair} from "./pair-common";

export function isGUniPool(address: Address): boolean {
  let contract = GUniPool.bind(address);
  let res = contract.try_getUnderlyingBalances();
  return res.reverted === false;
}

export function loadOrAddGUniPoolPair(parentToken: Token): Pair {
  let pair = new Pair(parentToken.address);

  if (!pair) {
    let pairContract = GUniPool.bind(Address.fromString(parentToken.address));
    return addPair(
      parentToken,
      pairContract.token0(),
      pairContract.token1(),
      "GUniPool"
    );
  }

  return pair;
}
