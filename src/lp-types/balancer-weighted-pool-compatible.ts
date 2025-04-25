import { Address } from "@graphprotocol/graph-ts";
import { BalancerVaultAbi } from "../../generated/templates/BalancerVaultAbi/BalancerVaultAbi";
import { loadOrAddERC20Token } from "../erc20";
import { BalancerWeightedPool, Token } from "../../generated/schema";
import { BalancerWeightedPoolAbi } from "../../generated/templates/BalancerWeightedPoolAbi/BalancerWeightedPoolAbi";

export function isBalancerWeightedPoolCompatible(address: Address): boolean {
  let contract = BalancerWeightedPoolAbi.bind(address);
  let res = contract.try_getPoolId();
  return res.reverted === false;
}

export function loadOrAddBalancerWeightedPoolCompatiblePool(
  parentToken: Token
): BalancerWeightedPool {
  let balancerWeightedPool = BalancerWeightedPool.load(parentToken.id);

  if (!balancerWeightedPool) {
    balancerWeightedPool = new BalancerWeightedPool(parentToken.id);

    let poolContract = BalancerWeightedPoolAbi.bind(
      Address.fromString(parentToken.address)
    );
    let vaultAddress = poolContract.getVault();
    let poolId = poolContract.getPoolId();

    let vaultContract = BalancerVaultAbi.bind(vaultAddress);
    let tokens = vaultContract.getPoolTokens(poolId);

    let constituentTokens: string[] = [];
    for (let i = 0; i < tokens.getTokens().length; i++) {
      let token = loadOrAddERC20Token(tokens.getTokens().at(i), false, false);
      constituentTokens.push(token.id.toString());
    }

    parentToken.typeName = "BalancerWeightedPoolCompatible";
    balancerWeightedPool.poolId = poolId.toHexString().toLowerCase();
    balancerWeightedPool.vaultAddress = vaultAddress
      .toHexString()
      .toLowerCase();
    balancerWeightedPool.constituentTokens = constituentTokens;
    balancerWeightedPool.save();

    parentToken.balancerWeightedPool = balancerWeightedPool.id;
    parentToken.save();
  }
  return balancerWeightedPool;
}
