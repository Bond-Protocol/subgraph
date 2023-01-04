import {Address} from "@graphprotocol/graph-ts";
import {BalancerWeightedPool} from "../generated/templates/BalancerWeightedPool/BalancerWeightedPool";
import {BalancerPool, Token} from "../generated/schema";
import {BalancerVault} from "../generated/templates/BalancerVault/BalancerVault";
import {loadOrAddERC20Token} from "./erc20";

export function isBalancerPool(address: Address): boolean {
  let contract = BalancerWeightedPool.bind(address);
  let res = contract.try_getPoolId();
  return res.reverted === false;
}

export function erc20ToBalancerPoolToken(parentToken: Token): BalancerPool {
  let balancerPool = BalancerPool.load(parentToken.id);

  if (!balancerPool) {
    balancerPool = new BalancerPool(parentToken.id);

    let poolContract = BalancerWeightedPool.bind(Address.fromString(parentToken.address));
    let vaultAddress = poolContract.getVault();
    let poolId = poolContract.getPoolId();

    let vaultContract = BalancerVault.bind(vaultAddress);
    let tokens = vaultContract.getPoolTokens(poolId);

    let constituentTokens: string[] = [];
    for (let i = 0; i < tokens.getTokens().length; i++) {
      let token = loadOrAddERC20Token(tokens.getTokens().at(i));
      constituentTokens.push(token.id.toString());
    }

    parentToken.typeName = poolContract._name;
    balancerPool.poolId = poolId.toHexString().toLowerCase();
    balancerPool.vaultAddress = vaultAddress.toHexString().toLowerCase();
    balancerPool.constituentTokens = constituentTokens;
    balancerPool.save();

    parentToken.balancerPool = balancerPool.id;
    parentToken.save();
  }
  return balancerPool;
}
