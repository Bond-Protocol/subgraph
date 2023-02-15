import {Address} from "@graphprotocol/graph-ts";
import {Pair, Token} from "../../generated/schema";
import {GUniPoolAbi} from "../../generated/templates/GUniPoolAbi/GUniPoolAbi";
import {addPair} from "./pair-common";

export function isGUniPoolCompatible(address: Address): boolean {
  let contract = GUniPoolAbi.bind(address);
  let res = contract.try_getUnderlyingBalances();
  return res.reverted === false;
}

export function loadOrAddGUniPoolCompatiblePair(parentToken: Token): Pair {
  let pair = new Pair(parentToken.address);

  if (!pair) {
    let pairContract = GUniPoolAbi.bind(Address.fromString(parentToken.address));
    return addPair(
      parentToken,
      pairContract.token0(),
      pairContract.token1(),
      "GUniPoolCompatible"
    );
  }

  return pair;
}
