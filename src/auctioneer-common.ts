import {Address, BigDecimal, BigInt, dataSource} from "@graphprotocol/graph-ts";
import {Market, Token} from "../generated/schema";
import {Auctioneer} from "../generated/templates/Auctioneer/Auctioneer";

export function createMarket(
  id: BigInt,
  vesting: BigInt,
  address: Address,
  timestamp: BigInt,
  auctioneerName: string,
  network: string,
  auctioneer: Address,
  payoutToken: Token,
  quoteToken: Token,
  vestingType: string,
): Market {
  const contract = Auctioneer.bind(address);
  let market = Market.load(id.toString());

  if (!market) {
    market = new Market(id.toString());
    market.id = dataSource.network() + "_" + auctioneerName + "_" + id.toString();
    market.name = auctioneerName;
    market.network = dataSource.network();
    market.auctioneer = address.toHexString();
    market.teller = contract.getTeller().toHexString();
    market.marketId = id;
    market.owner = contract.markets(id).value0.toHexString();
    market.payoutToken = payoutToken.id;
    market.quoteToken = quoteToken.id;
    market.vesting = vesting;
    market.vestingType = vestingType;
    market.isLive = contract.isLive(id);
    market.isInstantSwap = contract.isInstantSwap(id);
    market.totalBondedAmount = BigDecimal.fromString("0");
    market.totalPayoutAmount = BigDecimal.fromString("0");
    market.scaleAdjustment = contract.marketScale(id);
    market.creationBlockTimestamp = timestamp;

    market.save();
  }

  return market;
}

export function closeMarket(
  id: BigInt,
  auctioneerName: string,
  network: string,
): void {
  const marketId = network + "_" + auctioneerName + "_" + id.toString();
  const market = Market.load(marketId);

  if (!market) return;

  market.isLive = false;
  market.save();
}
