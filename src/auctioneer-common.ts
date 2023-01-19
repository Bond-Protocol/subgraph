import {Address, BigDecimal, BigInt, dataSource} from "@graphprotocol/graph-ts";
import {Market} from "../generated/schema";
import {Auctioneer} from "../generated/templates/Auctioneer/Auctioneer";
import {loadOrAddERC20Token} from "./erc20";
import {erc20ToBalancerPoolToken, isBalancerPool} from "./balancer-pool";
import {erc20ToSlpPair, isLpToken} from "./slp";
import {CHAIN_IDS} from "./chain-ids";

export function createMarket(
  id: BigInt,
  vesting: BigInt,
  address: Address,
  timestamp: BigInt,
  auctioneerName: string,
  auctioneer: Address,
  payoutTokenAddress: Address,
  quoteTokenAddress: Address,
  vestingType: string,
): Market {
  let payoutToken = loadOrAddERC20Token(payoutTokenAddress);
  let quoteToken = loadOrAddERC20Token(quoteTokenAddress);

  const network = dataSource.network();
  const chainId = CHAIN_IDS.get(network).toString();

  if (isBalancerPool(quoteTokenAddress)) {
    erc20ToBalancerPoolToken(quoteToken);
  } else if (isLpToken(quoteTokenAddress)) {
    erc20ToSlpPair(quoteToken);
  }

  const contract = Auctioneer.bind(address);
  let market = Market.load(id.toString());

  if (!market) {
    const markets = contract.markets(id);

    market = new Market(id.toString());
    market.id = chainId + "_" + auctioneerName + "_" + id.toString();
    market.name = auctioneerName;
    market.network = network;
    market.chainId = BigInt.fromString(chainId);
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
    market.callbackAddress = markets.getCallbackAddr().toHexString();
    market.capacity = markets.getCapacity();
    market.capacityInQuote = markets.getCapacityInQuote();
    market.minPrice = markets.getMinPrice();
    market.scale = markets.getScale();

    market.save();
  }

  return market;
}

export function closeMarket(
  id: BigInt,
  auctioneerName: string,
): void {
  const marketId = CHAIN_IDS.get(dataSource.network()).toString() + "_" + auctioneerName + "_" + id.toString();
  const market = Market.load(marketId);

  if (!market) return;

  market.isLive = false;
  market.save();
}
