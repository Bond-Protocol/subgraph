import {Address} from "@graphprotocol/graph-ts";
import {Pair, Token} from "../../generated/schema";
import {VolatileV1AMM} from "../../generated/templates/VolatileV1AMM/VolatileV1AMM";
import {addPair} from "./pair-common";

export function isVolatileV1AMM(address: Address): boolean {
  let contract = VolatileV1AMM.bind(address);
  let res = contract.try_getReserves();
  return res.reverted === false;
}

export function loadOrAddVolatileV1AMMPair(parentToken: Token): Pair {
  let pair = new Pair(parentToken.address);

  if (!pair) {
    let pairContract = VolatileV1AMM.bind(Address.fromString(parentToken.address));
    return addPair(
      parentToken,
      pairContract.token0(),
      pairContract.token1(),
      "VolatileV1AMM"
    );
  }

  return pair;
}
