import { Address } from "@graphprotocol/graph-ts";
import { Pair, Token } from "../../generated/schema";
import { HypervisorAbi } from "../../generated/templates/HypervisorAbi/HypervisorAbi";
import { addPair } from "./pair-common";

export function isHypervisorCompatible(address: Address): boolean {
  let contract = HypervisorAbi.bind(address);
  let res = contract.try_getTotalAmounts();
  return res.reverted === false;
}

export function loadOrAddHypervisorCompatiblePair(parentToken: Token): Pair {
  let pair = new Pair(parentToken.address);

  if (!pair) {
    let pairContract = HypervisorAbi.bind(
      Address.fromString(parentToken.address)
    );
    return addPair(
      parentToken,
      pairContract.token0(),
      pairContract.token1(),
      "HypervisorCompatible"
    );
  }

  return pair;
}
