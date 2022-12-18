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
  const payoutTokenId = dataSource.network() + "_" + event.params.payoutToken.toHexString().toLowerCase();
  const quoteTokenId = dataSource.network() + "_" + event.params.quoteToken.toHexString().toLowerCase();
  let payoutToken = Token.load(payoutTokenId);
  let quoteToken = Token.load(quoteTokenId);

  if (!payoutToken) {
    let payoutTokenContract = ERC20.bind(event.params.payoutToken);
    payoutToken = new Token(payoutTokenId);
    payoutToken.network = dataSource.network();
    payoutToken.address = event.params.payoutToken.toHexString().toLowerCase();
    payoutToken.decimals = payoutTokenContract.decimals();
    payoutToken.symbol = payoutTokenContract.symbol();
    payoutToken.name = payoutTokenContract.name();
    payoutToken.typeName = payoutTokenContract._name;
    payoutToken.save();
  }

  if (!quoteToken) {
    let quoteTokenContract = ERC20.bind(event.params.quoteToken);
    quoteToken = new Token(quoteTokenId);
    quoteToken.network = dataSource.network();
    quoteToken.address = event.params.quoteToken.toHexString().toLowerCase();
    quoteToken.decimals = quoteTokenContract.decimals();
    quoteToken.symbol = quoteTokenContract.symbol();
    quoteToken.name = quoteTokenContract.name();
    quoteToken.typeName = quoteTokenContract._name;

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
          let token = Token.load(dataSource.network() + "_" + tokens.getTokens().at(i).toHexString().toLowerCase());
          if (!token) {
            let tokenContract = ERC20.bind(tokens.getTokens().at(i));
            token = new Token(dataSource.network() + "_" + tokens.getTokens().at(i).toHexString().toLowerCase());
            token.network = dataSource.network();
            token.address = tokens.getTokens().at(i).toHexString().toLowerCase();
            token.decimals = tokenContract.decimals();
            token.symbol = tokenContract.symbol();
            token.name = tokenContract.name();
            token.typeName = tokenContract._name;
            token.save();
          }
          constituentTokens.push(token.id.toString());
        }

        quoteToken.typeName = poolContract._name;
        balancerPool.poolId = poolId.toHexString().toLowerCase();
        balancerPool.vaultAddress = vaultAddress.toHexString().toLowerCase();
        balancerPool.constituentTokens = constituentTokens;
        balancerPool.save();

        quoteToken.balancerPool = balancerPool.id;
      }
    } else if (LP_PAIR_TYPES.includes(quoteTokenContract.symbol())) {
      let pairContract = SLP.bind(event.params.quoteToken);
      let pair = new Pair(event.params.quoteToken.toHexString().toLowerCase());

      let token0Id = dataSource.network() + "_" + pairContract.token0().toHexString().toLowerCase();
      let token1Id = dataSource.network() + "_" + pairContract.token1().toHexString().toLowerCase();

      let token0 = Token.load(token0Id);
      let token1 = Token.load(token1Id);

      if (!token0) {
        let token0Contract = ERC20.bind(pairContract.token0());
        token0 = new Token(token0Id);
        token0.network = dataSource.network();
        token0.address = pairContract.token0().toHexString();
        token0.decimals = token0Contract.decimals();
        token0.symbol = token0Contract.symbol();
        token0.name = token0Contract.name();
        token0.typeName = token0Contract._name;
        token0.save();
      }

      if (!token1) {
        let token1Contract = ERC20.bind(pairContract.token1());
        token1 = new Token(token1Id);
        token1.network = dataSource.network();
        token1.address = pairContract.token1().toHexString();
        token1.decimals = token1Contract.decimals();
        token1.symbol = token1Contract.symbol();
        token1.name = token1Contract.name();
        token1.typeName = token1Contract._name;
        token1.save();
      }

      pair.token0 = token0.id;
      pair.token1 = token1.id;
      pair.save();

      quoteToken.typeName = pairContract._name;
      quoteToken.lpPair = pair.id;
    }
    quoteToken.save();
  }

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
  market.payoutToken = payoutTokenId;
  market.quoteToken = quoteTokenId;
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
