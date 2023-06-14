import {
  AuthorityUpdated,
  BondFixedExpOFDAAbi,
  MarketClosed,
  MarketCreated
} from "../generated/BondFixedExpOFDAAbi/BondFixedExpOFDAAbi";
import {closeMarket, createMarket} from "./auctioneer-common";

const AUCTIONEER_NAME = "BondFixedExpOFDA";
const AUCTION_TYPE = "oracle-static";

export function handleAuthorityUpdated(event: AuthorityUpdated): void {
}

export function handleMarketClosed(event: MarketClosed): void {
  closeMarket(
    event.params.id,
    AUCTIONEER_NAME
  );
}

export function handleMarketCreated(event: MarketCreated): void {
  const contract = BondFixedExpOFDAAbi.bind(event.address);
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
    null,
    null,
    null
  );
}
