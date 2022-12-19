import {
  AuthorityUpdated,
  BondFixedExpCDA,
  MarketClosed,
  MarketCreated,
  Tuned
} from "../generated/BondFixedExpCDA/BondFixedExpCDA";
import {dataSource} from '@graphprotocol/graph-ts'
import {closeMarket, createMarket} from "./auctioneer-common";

export function handleAuthorityUpdated(event: AuthorityUpdated): void {
}

export function handleMarketClosed(event: MarketClosed): void {
  closeMarket(
    event.params.id,
    "BondFixedExpCDA",
    dataSource.network()
  );
}

export function handleMarketCreated(event: MarketCreated): void {
  createMarket(
    event.params.id,
    event.params.vesting,
    event.address,
    event.block.timestamp,
    "BondFixedExpCDA",
    dataSource.network(),
    event.address,
    event.params.payoutToken,
    event.params.quoteToken,
    "fixed-expiration"
  );
}

export function handleTuned(event: Tuned): void {
}
