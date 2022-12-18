import {Address, BigDecimal, BigInt, dataSource} from "@graphprotocol/graph-ts";
import {BalancerPool, Market, Pair} from "../generated/schema";
import {Auctioneer} from "../generated/templates/Auctioneer/Auctioneer";
import {loadOrAddERC20Token} from "./erc20";
import {isBalancerPool} from "./balancer-pool";
import {BalancerWeightedPool} from "../generated/templates/BalancerWeightedPool/BalancerWeightedPool";
import {BalancerVault} from "../generated/templates/BalancerVault/BalancerVault";
import {isLpToken} from "./slp";
import {SLP} from "../generated/templates/SLP/SLP";

export function createMarket(
  id: BigInt,
  vesting: BigInt,
  address: Address,
  timestamp: BigInt,
  auctioneerName: string,
  network: string,
  auctioneer: Address,
  payoutTokenAddress: Address,
  quoteTokenAddress: Address,
  vestingType: string,
): Market {
  let payoutToken = loadOrAddERC20Token(network, payoutTokenAddress);
  let quoteToken = loadOrAddERC20Token(network, quoteTokenAddress);

  if (isBalancerPool(quoteTokenAddress)) {
    let balancerPool = BalancerPool.load(dataSource.network() + "_" + quoteTokenAddress.toHexString().toLowerCase());

    if (!balancerPool) {
      balancerPool = new BalancerPool(dataSource.network() + "_" + quoteTokenAddress.toHexString().toLowerCase());

      let poolContract = BalancerWeightedPool.bind(quoteTokenAddress);
      let vaultAddress = poolContract.getVault();
      let poolId = poolContract.getPoolId();

      let vaultContract = BalancerVault.bind(vaultAddress);
      let tokens = vaultContract.getPoolTokens(poolId);

      let constituentTokens: string[] = [];
      for (let i = 0; i < tokens.getTokens().length; i++) {
        let token = loadOrAddERC20Token(dataSource.network(), tokens.getTokens().at(i));
        constituentTokens.push(token.id.toString());
      }

      quoteToken.typeName = poolContract._name;
      balancerPool.poolId = poolId.toHexString().toLowerCase();
      balancerPool.vaultAddress = vaultAddress.toHexString().toLowerCase();
      balancerPool.constituentTokens = constituentTokens;
      balancerPool.save();

      quoteToken.balancerPool = balancerPool.id;
    }
  } else if (isLpToken(quoteTokenAddress)) {
    let pairContract = SLP.bind(quoteTokenAddress);
    let pair = new Pair(quoteTokenAddress.toHexString().toLowerCase());

    let token0 = loadOrAddERC20Token(dataSource.network(), pairContract.token0());
    let token1 = loadOrAddERC20Token(dataSource.network(), pairContract.token1());

    pair.token0 = token0.id;
    pair.token1 = token1.id;
    pair.save();

    quoteToken.typeName = pairContract._name;
    quoteToken.lpPair = pair.id;
  }
  quoteToken.save();

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
