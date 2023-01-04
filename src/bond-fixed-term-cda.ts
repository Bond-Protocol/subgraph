import {
  AuthorityUpdated,
  BondFixedTermCDA,
  MarketClosed,
  MarketCreated,
  Tuned
} from "../generated/BondFixedTermCDA/BondFixedTermCDA"
import {closeMarket, createMarket} from "./auctioneer-common";

export function handleAuthorityUpdated(event: AuthorityUpdated): void {
}

export function handleMarketClosed(event: MarketClosed): void {
  closeMarket(
    event.params.id,
    "BondFixedTermCDA"
  );
}

export function handleMarketCreated(event: MarketCreated): void {
  createMarket(
    event.params.id,
    event.params.vesting,
    event.address,
    event.block.timestamp,
    "BondFixedTermCDA",
    event.address,
    event.params.payoutToken,
    event.params.quoteToken,
    "fixed-term"
  );
}

export function handleTuned(event: Tuned): void {
}
