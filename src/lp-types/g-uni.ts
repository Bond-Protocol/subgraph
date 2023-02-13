import {Address} from "@graphprotocol/graph-ts";
import {Pair, Token} from "../../generated/schema";
import {loadOrAddERC20Token} from "../erc20";
import {GUniPool} from "../../generated/templates/GUniPool/GUniPool";

export function isGUniPool(address: Address): boolean {
  let contract = GUniPool.bind(address);
  let res = contract.try_getUnderlyingBalances();
  return res.reverted === false;
}

export function erc20ToGUniPool(parentToken: Token): Pair {
  let pair = Pair.load(parentToken.id);

  if (!pair) {
    pair = new Pair(parentToken.address);

    let pairContract = GUniPool.bind(Address.fromString(parentToken.address));

    let token0 = loadOrAddERC20Token(pairContract.token0());
    let token1 = loadOrAddERC20Token(pairContract.token1());

    pair.token0 = token0.id;
    pair.token1 = token1.id;
    pair.save();

    parentToken.typeName = "GUniPool";
    parentToken.lpPair = pair.id;
    parentToken.save();
  }
  return pair;
}
