import {Address} from "@graphprotocol/graph-ts";
import {SLP} from "../generated/templates/SLP/SLP";
import {Pair, Token} from "../generated/schema";
import {loadOrAddERC20Token} from "./erc20";

export function isLpToken(address: Address): boolean {
  let contract = SLP.bind(address);
  let res = contract.try_getReserves();
  return res.reverted === false;
}

export function erc20ToSlpPair(parentToken: Token): Pair {
  let pair = Pair.load(parentToken.id);

  if (!pair) {
    pair = new Pair(parentToken.address);

    let pairContract = SLP.bind(Address.fromString(parentToken.address));

    let token0 = loadOrAddERC20Token(pairContract.token0());
    let token1 = loadOrAddERC20Token(pairContract.token1());

    pair.token0 = token0.id;
    pair.token1 = token1.id;
    pair.save();

    parentToken.typeName = pairContract._name;
    parentToken.lpPair = pair.id;
    parentToken.save();
  }
  return pair;
}
