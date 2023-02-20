import {
  AuthorityUpdated,
  MarketClosed,
  MarketCreated,
  Tuned
} from "../generated/BondFixedTermCDAAbi/BondFixedTermCDAAbi"
import {closeMarket, createMarket, onTuned} from "./auctioneer-common";

const AUCTIONEER_NAME = "BondFixedTermCDA";

export function handleAuthorityUpdated(event: AuthorityUpdated): void {
}

export function handleMarketClosed(event: MarketClosed): void {
  closeMarket(
    event.params.id,
    AUCTIONEER_NAME
  );
}

export function handleMarketCreated(event: MarketCreated): void {
  createMarket(
    event.params.id,
    event.params.vesting,
    event.address,
    event.block.timestamp,
    AUCTIONEER_NAME,
    event.address,
    event.params.payoutToken,
    event.params.quoteToken,
    "fixed-term"
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
