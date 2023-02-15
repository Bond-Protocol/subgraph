import {Address} from "@graphprotocol/graph-ts";
import {UniV2} from "../../generated/templates/UniV2/UniV2";
import {Pair, Token} from "../../generated/schema";
import {addPair} from "./pair-common";

export function isUniV2(address: Address): boolean {
  let contract = UniV2.bind(address);
  let res = contract.try_getReserves();
  return res.reverted === false;
}

export function loadOrAddUniV2Pair(parentToken: Token): Pair {
  let pair = new Pair(parentToken.address);

  if (!pair) {
    let pairContract = UniV2.bind(Address.fromString(parentToken.address));
    return addPair(
      parentToken,
      pairContract.token0(),
      pairContract.token1(),
      "UniV2"
    );
  }

  return pair;
}
