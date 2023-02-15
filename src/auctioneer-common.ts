import {Address, BigDecimal, BigInt, dataSource} from "@graphprotocol/graph-ts";
import {Market, Tune} from "../generated/schema";
import {Auctioneer} from "../generated/templates/Auctioneer/Auctioneer";
import {loadOrAddERC20Token} from "./erc20";
import {isBalancerPool, loadOrAddBalancerPool} from "./lp-types/balancer-pool";
import {isUniV2, loadOrAddUniV2Pair} from "./lp-types/uni-v2";
import {CHAIN_IDS} from "./chain-ids";
import {isDodoLpToken, loadOrAddDodoLpPair} from "./lp-types/dodo";
import {isGUniPool, loadOrAddGUniPoolPair} from "./lp-types/g-uni";
import {isHypervisor, loadOrAddHypervisorPair} from "./lp-types/hypervisor";
import {isICHIVault, loadOrAddICHIVaultPair} from "./lp-types/ichi-vault";
import {isVFloat, loadOrAddVFloatPair} from "./lp-types/v-float";
import {isVolatileV1AMM, loadOrAddVolatileV1AMMPair} from "./lp-types/volatile-v1-amm";

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
    loadOrAddBalancerPool(quoteToken);
  } else if (isDodoLpToken(quoteTokenAddress)) {
    loadOrAddDodoLpPair(quoteToken);
  } else if (isGUniPool(quoteTokenAddress)) {
    loadOrAddGUniPoolPair(quoteToken);
  } else if (isHypervisor(quoteTokenAddress)) {
    loadOrAddHypervisorPair(quoteToken);
  } else if (isICHIVault(quoteTokenAddress)) {
    loadOrAddICHIVaultPair(quoteToken);
  } else if (isUniV2(quoteTokenAddress)) {
    loadOrAddUniV2Pair(quoteToken);
  } else if (isVFloat(quoteTokenAddress)) {
    loadOrAddVFloatPair(quoteToken);
  } else if (isVolatileV1AMM(quoteTokenAddress)) {
    loadOrAddVolatileV1AMMPair(quoteToken);
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
