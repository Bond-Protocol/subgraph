import {Address} from "@graphprotocol/graph-ts";
import {Pair, Token} from "../../generated/schema";
import {loadOrAddERC20Token} from "../erc20";
import {VolatileV1AMM} from "../../generated/templates/VolatileV1AMM/VolatileV1AMM";

export function isVolatileV1AMM(address: Address): boolean {
  let contract = VolatileV1AMM.bind(address);
  let res = contract.try_getReserves();
  return res.reverted === false;
}

export function erc20ToVolatileV1AMM(parentToken: Token): Pair {
  let pair = Pair.load(parentToken.id);

  if (!pair) {
    pair = new Pair(parentToken.address);

    let pairContract = VolatileV1AMM.bind(Address.fromString(parentToken.address));

    let token0 = loadOrAddERC20Token(pairContract.token0());
    let token1 = loadOrAddERC20Token(pairContract.token1());

    pair.token0 = token0.id;
    pair.token1 = token1.id;
    pair.save();

    parentToken.typeName = "VolatileV1AMM";
    parentToken.lpPair = pair.id;
    parentToken.save();
  }
  return pair;
}
