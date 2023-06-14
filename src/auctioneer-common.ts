import {Address, BigDecimal, BigInt, dataSource} from "@graphprotocol/graph-ts";
import {Market, MarketOwnerCount, Tune} from "../generated/schema";
import {loadOrAddERC20Token} from "./erc20";
import {
  isBalancerWeightedPoolCompatible,
  loadOrAddBalancerWeightedPoolCompatiblePool
} from "./lp-types/balancer-weighted-pool-compatible";
import {isUniV2Compatible, loadOrAddUniV2CompatiblePair} from "./lp-types/uni-v2-compatible";
import {CHAIN_IDS} from "./chain-ids";
import {isDodoLpCompatible, loadOrAddDodoLpCompatiblePair} from "./lp-types/dodo-compatible";
import {isGUniPoolCompatible, loadOrAddGUniPoolCompatiblePair} from "./lp-types/g-uni-compatible";
import {isHypervisorCompatible, loadOrAddHypervisorCompatiblePair} from "./lp-types/hypervisor-compatible";

export function createMarket(
  id: BigInt,
  vesting: BigInt,
  timestamp: BigInt,
  start: BigInt | null,
  conclusion: BigInt,
  auctioneerName: string,
  auctioneer: Address,
  type: string,
  payoutTokenAddress: Address,
  quoteTokenAddress: Address,
  vestingType: string,
  callbackAddress: string,
  capacity: BigInt,
  capacityInQuote: boolean,
  teller: string,
  owner: string,
  isInstantSwap: boolean,
  scale: BigInt | null,
  minPrice: BigInt | null,
  price: BigInt | null,
): Market {
  let payoutToken = loadOrAddERC20Token(payoutTokenAddress, true, false);
  let quoteToken = loadOrAddERC20Token(quoteTokenAddress, false, true);

  const network = dataSource.network();
  const chainId = CHAIN_IDS.get(network).toString();

  if (isBalancerWeightedPoolCompatible(quoteTokenAddress)) {
    loadOrAddBalancerWeightedPoolCompatiblePool(quoteToken);
  } else if (isDodoLpCompatible(quoteTokenAddress)) {
    loadOrAddDodoLpCompatiblePair(quoteToken);
  } else if (isGUniPoolCompatible(quoteTokenAddress)) {
    loadOrAddGUniPoolCompatiblePair(quoteToken);
  } else if (isHypervisorCompatible(quoteTokenAddress)) {
    loadOrAddHypervisorCompatiblePair(quoteToken);
  } else if (isUniV2Compatible(quoteTokenAddress)) {
    loadOrAddUniV2CompatiblePair(quoteToken);
  }

  let market = Market.load(id.toString());

  if (!market) {

    market = new Market(id.toString());
    market.id = chainId + "_" + auctioneerName + "_" + id.toString();
    market.name = auctioneerName;
    market.network = network;
    market.chainId = BigInt.fromString(chainId);
    market.auctioneer = auctioneer.toHexString();
    market.type = type;
    market.marketId = id;
    market.payoutToken = payoutToken.id;
    market.quoteToken = quoteToken.id;
    market.vesting = vesting;
    market.vestingType = vestingType;
    market.totalBondedAmount = BigDecimal.fromString("0");
    market.totalPayoutAmount = BigDecimal.fromString("0");
    market.averageBondPrice = BigDecimal.fromString("0");
    market.creationBlockTimestamp = timestamp;
    market.start = start;
    market.conclusion = conclusion;
    market.callbackAddress = callbackAddress;
    market.capacity = capacity;
    market.capacityInQuote = capacityInQuote;
    market.teller = teller;
    market.owner = owner;
    market.isInstantSwap = isInstantSwap;
    market.hasClosed = false;
    market.bondsIssued = BigInt.zero();
    price && (market.price = price);
    minPrice && (market.minPrice = minPrice);
    scale && (market.scale = scale);

    market.save();
  }

  let marketOwnerCount = MarketOwnerCount.load(owner.toString());
  if (!marketOwnerCount) {
    marketOwnerCount = new MarketOwnerCount(owner.toString());
    marketOwnerCount.count = BigInt.fromI32(1);
  } else {
    marketOwnerCount.count = marketOwnerCount.count.plus(BigInt.fromI32(1));
  }

  marketOwnerCount.save();

  return market;
}

export function closeMarket(
  id: BigInt,
  auctioneerName: string,
): void {
  const marketId = CHAIN_IDS.get(dataSource.network()).toString() + "_" + auctioneerName + "_" + id.toString();
  const market = Market.load(marketId);

  if (!market) return;

  market.hasClosed = true;
  market.save();
}

export function onTuned(
  id: BigInt,
  auctioneerName: String,
  oldControlVariable: BigInt,
  newControlVariable: BigInt,
  timestamp: BigInt
): void {
  const network = dataSource.network();
  const chainId = CHAIN_IDS.get(network).toString();
  const marketId = chainId + "_" + auctioneerName + "_" + id.toString();

  let tune = Tune.load(marketId);
  if (!tune) tune = new Tune(marketId);

  tune.market = marketId;
  tune.oldControlVariable = oldControlVariable;
  tune.newControlVariable = newControlVariable;
  tune.deltaTime = oldControlVariable.minus(newControlVariable);
  tune.timestamp = timestamp;

  tune.save();
}
