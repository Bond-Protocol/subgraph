import {
  AuthorityUpdated,
  BondFixedTermCDA,
  MarketClosed,
  MarketCreated,
  Tuned
} from "../generated/BondFixedTermCDA/BondFixedTermCDA"
import {BalancerPool, Market, Pair, Token} from "../generated/schema";
import {ERC20} from "../generated/templates/ERC20/ERC20";
import {SLP} from "../generated/templates/SLP/SLP";
import {Address, BigDecimal, dataSource} from '@graphprotocol/graph-ts'
import {LP_PAIR_TYPES} from "./lp-pair-types";
import {BalancerWeightedPool} from "../generated/templates/BalancerWeightedPool/BalancerWeightedPool";
import {BalancerVault} from "../generated/templates/BalancerVault/BalancerVault";
import {isBalancerPool} from "./balancer-pool";
import {loadOrAddERC20Token} from "./erc20";
import {isLpToken} from "./slp";

export function handleAuthorityUpdated(event: AuthorityUpdated): void {
}

export function handleMarketClosed(event: MarketClosed): void {
  const id = event.params.id.toString();

  let contract = BondFixedTermCDA.bind(event.address)
  let market = Market.load(dataSource.network() + "_" + contract._name + "_" + id);

  if (!market) return;

  market.isLive = false;
  market.save();
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

  const id = event.params.id.toString();

  let market = Market.load(id);

  if (!market) {
    market = new Market(id);
  }

  let contract = BondFixedTermCDA.bind(event.address)
  market.id = dataSource.network() + "_" + contract._name + "_" + id;
  market.name = contract._name;
  market.network = dataSource.network();
  market.auctioneer = event.address.toHexString();
  market.teller = contract.getTeller().toHexString();
  market.marketId = event.params.id;
  market.owner = contract.markets(event.params.id).value0.toHexString();
  market.payoutToken = payoutToken.id;
  market.quoteToken = quoteToken.id;
  market.vesting = event.params.vesting;
  market.vestingType = "fixed-term";
  market.isLive = contract.isLive(event.params.id);
  market.isInstantSwap = contract.isInstantSwap(event.params.id);
  market.totalBondedAmount = BigDecimal.fromString("0");
  market.totalPayoutAmount = BigDecimal.fromString("0");
  market.scaleAdjustment = contract.marketScale(event.params.id);
  market.creationBlockTimestamp = event.block.timestamp;

  market.save();
}

export function handleTuned(event: Tuned): void {
}
