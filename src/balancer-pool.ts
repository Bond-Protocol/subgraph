import {Address} from "@graphprotocol/graph-ts";
import {BalancerWeightedPool} from "../generated/templates/BalancerWeightedPool/BalancerWeightedPool";

export function isBalancerPool(address: Address): boolean {
  let contract = BalancerWeightedPool.bind(address);
  let res = contract.try_getPoolId();
  return res.reverted === false;
}
