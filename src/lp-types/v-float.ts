import {Address} from "@graphprotocol/graph-ts";
import {Pair, Token} from "../../generated/schema";
import {loadOrAddERC20Token} from "../erc20";
import {vFloat} from "../../generated/templates/vFloat/vFloat";

export function isVFloat(address: Address): boolean {
  let contract = vFloat.bind(address);
  let res = contract.try_getTotalAmounts();
  return res.reverted === false;
}

export function erc20ToVFloat(parentToken: Token): Pair {
  let pair = Pair.load(parentToken.id);

  if (!pair) {
    pair = new Pair(parentToken.address);

    let pairContract = vFloat.bind(Address.fromString(parentToken.address));

    let token0 = loadOrAddERC20Token(pairContract.token0());
    let token1 = loadOrAddERC20Token(pairContract.token1());

    pair.token0 = token0.id;
    pair.token1 = token1.id;
    pair.save();

    parentToken.typeName = "vFloat";
    parentToken.lpPair = pair.id;
    parentToken.save();
  }
  return pair;
}
