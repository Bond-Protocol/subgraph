import {
  AuthorityUpdated,
  BondFixedTermCDA,
  MarketClosed,
  MarketCreated,
  Tuned
} from "../generated/BondFixedTermCDA/BondFixedTermCDA"
import {dataSource} from '@graphprotocol/graph-ts'
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
  createMarket(
    event.params.id,
    event.params.vesting,
    event.address,
    event.block.timestamp,
    "BondFixedTermCDA",
    dataSource.network(),
    event.address,
    event.params.payoutToken,
    event.params.quoteToken,
    "fixed-term"
  );
}

export function handleTuned(event: Tuned): void {
}
