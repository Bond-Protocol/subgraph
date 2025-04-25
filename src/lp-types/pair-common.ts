import { Pair, Token } from "../../generated/schema";
import { Address } from "@graphprotocol/graph-ts";
import { loadOrAddERC20Token } from "../erc20";

export function addPair(
  parentToken: Token,
  token0Address: Address,
  token1Address: Address,
  typeName: string
): Pair {
  let pair = new Pair(parentToken.address);

  let token0 = loadOrAddERC20Token(token0Address, false, false);
  let token1 = loadOrAddERC20Token(token1Address, false, false);

  pair.token0 = token0.id;
  pair.token1 = token1.id;
  pair.save();

  parentToken.typeName = typeName;
  parentToken.lpPair = pair.id;
  parentToken.save();

  return pair;
}
