import {
  AuthorityUpdated,
  BondFixedExpCDA,
  MarketClosed,
  MarketCreated,
  Tuned
} from "../generated/BondFixedExpCDA/BondFixedExpCDA";
import {Market, Pair, Token} from "../generated/schema";
import {ERC20} from "../generated/templates/ERC20/ERC20";
import {SLP} from "../generated/templates/SLP/SLP";
import {BigDecimal, dataSource} from '@graphprotocol/graph-ts'
import {LP_PAIR_TYPES} from "./lp-pair-types";

export function handleAuthorityUpdated(event: AuthorityUpdated): void {
  // Note: If a handler doesn't require existing field values, it is faster
  // _not_ to load the entity from the store. Instead, create it fresh with
  // `new Entity(...)`, set the fields that should be updated and save the
  // entity back to the store. Fields that were not set or unset remain
  // unchanged, allowing for partial updates to be applied.

  // It is also possible to access smart contracts from mappings. For
  // example, the contract that has emitted the event can be connected to
  // with:
  //
  // let contract = Contract.bind(event.address)
  //
  // The following functions can then be called on this contract to access
  // state variables and other data:
  //
  // - contract.adjustments(...)
  // - contract.allowNewMarkets(...)
  // - contract.authority(...)
  // - contract.createMarket(...)
  // - contract.currentCapacity(...)
  // - contract.currentControlVariable(...)
  // - contract.currentDebt(...)
  // - contract.defaultTuneAdjustment(...)
  // - contract.defaultTuneInterval(...)
  // - contract.getAggregator(...)
  // - contract.getMarketInfoForPurchase(...)
  // - contract.getTeller(...)
  // - contract.isInstantSwap(...)
  // - contract.isLive(...)
  // - contract.marketPrice(...)
  // - contract.markets(...)
  // - contract.maxAmountAccepted(...)
  // - contract.metadata(...)
  // - contract.minDebtDecayInterval(...)
  // - contract.newOwners(...)
  // - contract.payoutFor(...)
  // - contract.purchaseBond(...)
  // - contract.terms(...)
}

export function handleMarketClosed(event: MarketClosed): void {
  const id = event.params.id.toString();

  let contract = BondFixedExpCDA.bind(event.address)
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

    if (LP_PAIR_TYPES.includes(quoteTokenContract.symbol())) {
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

  let contract = BondFixedExpCDA.bind(event.address)
  market.id = dataSource.network() + "_" + contract._name + "_" + id;
  market.name = contract._name;
  market.network = dataSource.network();
  market.auctioneer = event.address;
  market.teller = contract.getTeller();
  market.marketId = event.params.id;
  market.owner = contract.markets(event.params.id).value0.toHexString();
  market.payoutToken = payoutTokenId;
  market.quoteToken = quoteTokenId;
  market.vesting = event.params.vesting;
  market.vestingType = "fixed-expiration";
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
