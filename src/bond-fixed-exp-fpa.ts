import {
  AuthorityUpdated,
  BondFixedExpFPAAbi,
  MarketClosed,
  MarketCreated,
} from "../generated/BondFixedExpFPAAbi/BondFixedExpFPAAbi";
import { closeMarket, createMarket } from "./auctioneer-common";

const AUCTIONEER_NAME = "BondFixedExpFPA";
const AUCTION_TYPE = "static";

export function handleAuthorityUpdated(event: AuthorityUpdated): void {}

export function handleMarketClosed(event: MarketClosed): void {
  closeMarket(event.params.id, AUCTIONEER_NAME);
}

export function handleMarketCreated(event: MarketCreated): void {
  const contract = BondFixedExpFPAAbi.bind(event.address);
  const markets = contract.markets(event.params.id);

  const terms = contract.terms(event.params.id);

  createMarket(
    event.params.id,
    event.params.vesting,
    event.block.timestamp,
    terms.getStart(),
    terms.getConclusion(),
    AUCTIONEER_NAME,
    event.address,
    AUCTION_TYPE,
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
    null,
    markets.getPrice()
  );
}
