import {
  AuthorityUpdated,
  BondFixedTermCDA,
  MarketClosed,
  MarketCreated,
  Tuned
} from "../generated/BondFixedTermCDA/BondFixedTermCDA"
import {Market, Pair, Token} from "../generated/schema";
import {ERC20} from "../generated/templates/ERC20/ERC20";
import {SLP} from "../generated/templates/SLP/SLP";
import {dataSource} from '@graphprotocol/graph-ts'

export function handleAuthorityUpdated(event: AuthorityUpdated): void {
}

export function handleMarketClosed(event: MarketClosed): void {
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

    if (quoteTokenContract.symbol() == "UNI-V2") {
      let pairContract = SLP.bind(event.params.quoteToken);
      let pair = new Pair(event.params.quoteToken.toHexString().toLowerCase());

      let token0Id = dataSource.network() + "_" + pairContract.token0().toHexString();
      let token1Id = dataSource.network() + "_" + pairContract.token1().toHexString();

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
        token1.save();
      }

      pair.token0 = token0.id;
      pair.token1 = token1.id;
      pair.save();

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
  market.auctioneer = event.address;
  market.marketId = event.params.id;
  market.owner = contract.markets(event.params.id).value0;
  market.payoutToken = payoutTokenId;
  market.quoteToken = quoteTokenId;
  market.vesting = event.params.vesting;
  market.vestingType = "fixed-term";
  market.isLive = contract.isLive(event.params.id);
  market.isInstantSwap = contract.isInstantSwap(event.params.id);

  market.save();
}

export function handleTuned(event: Tuned): void {
}
