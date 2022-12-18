import {Address} from "@graphprotocol/graph-ts";
import {SLP} from "../generated/templates/SLP/SLP";

export function isLpToken(address: Address): boolean {
  let contract = SLP.bind(address);
  let res = contract.try_getReserves();
  return res.reverted === false;
}
