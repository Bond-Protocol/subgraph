import {Address} from "@graphprotocol/graph-ts";
import {Pair, Token} from "../../generated/schema";
import {loadOrAddERC20Token} from "../erc20";
import {DodoLp} from "../../generated/templates/DodoLp/DodoLp";

export function isDodoLpToken(address: Address): boolean {
  let contract = DodoLp.bind(address);
  let res = contract.try_getVaultReserve();
  return res.reverted === false;
}

export function erc20ToDodoLpPair(parentToken: Token): Pair {
  let pair = Pair.load(parentToken.id);

  if (!pair) {
    pair = new Pair(parentToken.address);

    let pairContract = DodoLp.bind(Address.fromString(parentToken.address));

    let token0 = loadOrAddERC20Token(pairContract._BASE_TOKEN_());
    let token1 = loadOrAddERC20Token(pairContract._QUOTE_TOKEN_());

    pair.token0 = token0.id;
    pair.token1 = token1.id;
    pair.save();

    parentToken.typeName = "DodoLp";
    parentToken.lpPair = pair.id;
    parentToken.save();
  }
  return pair;
}
