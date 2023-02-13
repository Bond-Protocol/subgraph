import {Address} from "@graphprotocol/graph-ts";
import {Pair, Token} from "../../generated/schema";
import {loadOrAddERC20Token} from "../erc20";
import {ICHIVault} from "../../generated/templates/ICHIVault/ICHIVault";

export function isICHIVault(address: Address): boolean {
  let contract = ICHIVault.bind(address);
  let res = contract.try_getTotalAmounts();
  return res.reverted === false;
}

export function erc20ToICHIVault(parentToken: Token): Pair {
  let pair = Pair.load(parentToken.id);

  if (!pair) {
    pair = new Pair(parentToken.address);

    let pairContract = ICHIVault.bind(Address.fromString(parentToken.address));

    let token0 = loadOrAddERC20Token(pairContract.token0());
    let token1 = loadOrAddERC20Token(pairContract.token1());

    pair.token0 = token0.id;
    pair.token1 = token1.id;
    pair.save();

    parentToken.typeName = "ICHIVault";
    parentToken.lpPair = pair.id;
    parentToken.save();
  }
  return pair;
}
