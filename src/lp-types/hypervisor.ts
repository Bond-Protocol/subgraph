import {Address} from "@graphprotocol/graph-ts";
import {Pair, Token} from "../../generated/schema";
import {Hypervisor} from "../../generated/templates/Hypervisor/Hypervisor";
import {addPair} from "./pair-common";

export function isHypervisor(address: Address): boolean {
  let contract = Hypervisor.bind(address);
  let res = contract.try_getTotalAmounts();
  return res.reverted === false;
}

export function loadOrAddHypervisorPair(parentToken: Token): Pair {
  let pair = new Pair(parentToken.address);

  if (!pair) {
    let pairContract = Hypervisor.bind(Address.fromString(parentToken.address));
    return addPair(
      parentToken,
      pairContract.token0(),
      pairContract.token1(),
      "Hypervisor"
    );
  }

  return pair;
}
