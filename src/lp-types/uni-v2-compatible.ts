import { Address } from "@graphprotocol/graph-ts";
import { UniV2Abi } from "../../generated/templates/UniV2Abi/UniV2Abi";
import { Pair, Token } from "../../generated/schema";
import { addPair } from "./pair-common";

export function isUniV2Compatible(address: Address): boolean {
  let contract = UniV2Abi.bind(address);
  let res = contract.try_getReserves();
  return res.reverted === false;
}

export function loadOrAddUniV2CompatiblePair(parentToken: Token): Pair {
  let pair = Pair.load(parentToken.id);

  if (!pair) {
    let pairContract = UniV2Abi.bind(Address.fromString(parentToken.address));
    return addPair(
      parentToken,
      pairContract.token0(),
      pairContract.token1(),
      "UniV2Compatible"
    );
  }
  return pair;
}
