import {
  AuthorityUpdated,
  BondFixedTermCDA,
  MarketClosed,
  MarketCreated,
  Tuned
} from "../generated/BondFixedTermCDA/BondFixedTermCDA"
import {BalancerPool, Pair} from "../generated/schema";
import {SLP} from "../generated/templates/SLP/SLP";
import {dataSource} from '@graphprotocol/graph-ts'
import {BalancerWeightedPool} from "../generated/templates/BalancerWeightedPool/BalancerWeightedPool";
import {BalancerVault} from "../generated/templates/BalancerVault/BalancerVault";
import {isBalancerPool} from "./balancer-pool";
import {loadOrAddERC20Token} from "./erc20";
import {isLpToken} from "./slp";
import {closeMarket, createMarket} from "./auctioneer-common";

export function handleAuthorityUpdated(event: AuthorityUpdated): void {
}

export function handleMarketClosed(event: MarketClosed): void {
  closeMarket(
    event.params.id,
    "BondFixedTermCDA",
    dataSource.network()
  );
}

export function handleMarketCreated(event: MarketCreated): void {
  let payoutToken = loadOrAddERC20Token(dataSource.network(), event.params.payoutToken);
  let quoteToken = loadOrAddERC20Token(dataSource.network(), event.params.quoteToken);

  if (isBalancerPool(event.params.quoteToken)) {
    let balancerPool = BalancerPool.load(dataSource.network() + "_" + event.params.quoteToken.toHexString().toLowerCase());

    if (!balancerPool) {
      balancerPool = new BalancerPool(dataSource.network() + "_" + event.params.quoteToken.toHexString().toLowerCase());

      let poolContract = BalancerWeightedPool.bind(event.params.quoteToken);
      let vaultAddress = poolContract.getVault();
      let poolId = poolContract.getPoolId();

      let vaultContract = BalancerVault.bind(vaultAddress);
      let tokens = vaultContract.getPoolTokens(poolId);

      let constituentTokens: string[] = [];
      for (let i = 0; i < tokens.getTokens().length; i++) {
        let token = loadOrAddERC20Token(dataSource.network(), tokens.getTokens().at(i));
        constituentTokens.push(token.id.toString());
      }

      quoteToken.typeName = poolContract._name;
      balancerPool.poolId = poolId.toHexString().toLowerCase();
      balancerPool.vaultAddress = vaultAddress.toHexString().toLowerCase();
      balancerPool.constituentTokens = constituentTokens;
      balancerPool.save();

      quoteToken.balancerPool = balancerPool.id;
    }
  } else if (isLpToken(event.params.quoteToken)) {
    let pairContract = SLP.bind(event.params.quoteToken);
    let pair = new Pair(event.params.quoteToken.toHexString().toLowerCase());

    let token0 = loadOrAddERC20Token(dataSource.network(), pairContract.token0());
    let token1 = loadOrAddERC20Token(dataSource.network(), pairContract.token1());

    pair.token0 = token0.id;
    pair.token1 = token1.id;
    pair.save();

    quoteToken.typeName = pairContract._name;
    quoteToken.lpPair = pair.id;
  }
  quoteToken.save();

  createMarket(
    event.params.id,
    event.params.vesting,
    event.address,
    event.block.timestamp,
    "BondFixedTermCDA",
    dataSource.network(),
    event.address,
    payoutToken,
    quoteToken,
    "fixed-term"
  );
}

export function handleTuned(event: Tuned): void {
}
