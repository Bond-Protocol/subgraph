import {
  AuthorityUpdated,
  BondFixedExpCDAAbi,
  MarketClosed,
  MarketCreated,
  Tuned
} from "../generated/BondFixedExpCDAAbi/BondFixedExpCDAAbi";
import {closeMarket, createMarket, onTuned} from "./auctioneer-common";

const AUCTIONEER_NAME = "BondFixedExpCDA";

export function handleAuthorityUpdated(event: AuthorityUpdated): void {
}

export function handleMarketClosed(event: MarketClosed): void {
  closeMarket(
    event.params.id,
    AUCTIONEER_NAME
  );
}

export function handleMarketCreated(event: MarketCreated): void {
  const contract = BondFixedExpCDAAbi.bind(event.address);
  const markets = contract.markets(event.params.id);

  const terms = contract.terms(event.params.id);

  createMarket(
    event.params.id,
    event.params.vesting,
    event.block.timestamp,
    null,
    terms.getConclusion(),
    AUCTIONEER_NAME,
    event.address,
    event.params.payoutToken,
    event.params.quoteToken,
    "fixed-expiration",
    markets.getCallbackAddr().toHexString(),
    markets.getCapacity(),
    markets.getCapacityInQuote(),
    contract.getTeller().toHexString(),
    markets.value0.toHexString(),
    contract.isInstantSwap(event.params.id),
    contract.marketScale(event.params.id),
    markets.getMinPrice(),
    null,
  );
}

export function handleTuned(event: Tuned): void {
  onTuned(
    event.params.id,
    AUCTIONEER_NAME,
    event.params.oldControlVariable,
    event.params.newControlVariable,
    event.block.timestamp
  );
}
