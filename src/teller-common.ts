import {BondPurchase, BondToken, Market, OwnerTokenTbv, PurchaseCount, Token, UniqueBonder} from "../generated/schema";
import {Address, BigDecimal, BigInt, Bytes, dataSource, log} from "@graphprotocol/graph-ts";
import {CHAIN_IDS} from "./chain-ids";
import {loadOrAddERC20Token} from "./erc20";
import {AggregatorAbi} from "../generated/templates/AggregatorAbi/AggregatorAbi";
import {BondFixedTermCDAAbi} from "../generated/BondFixedTermCDAAbi/BondFixedTermCDAAbi";
import {BondFixedExpCDAAbi} from "../generated/BondFixedExpCDAAbi/BondFixedExpCDAAbi";
import {BondFixedExpOSDAAbi} from "../generated/BondFixedExpOSDAAbi/BondFixedExpOSDAAbi";
import {BondFixedTermOSDAAbi} from "../generated/BondFixedTermOSDAAbi/BondFixedTermOSDAAbi";
import {BondFixedExpOFDAAbi} from "../generated/BondFixedExpOFDAAbi/BondFixedExpOFDAAbi";
import {BondFixedTermOFDAAbi} from "../generated/BondFixedTermOFDAAbi/BondFixedTermOFDAAbi";
import {BondFixedExpFPAAbi} from "../generated/BondFixedExpFPAAbi/BondFixedExpFPAAbi";
import {BondFixedTermFPAAbi} from "../generated/BondFixedTermFPAAbi/BondFixedTermFPAAbi";
import {BondFixedExpSDAv1_1Abi} from "../generated/BondFixedExpSDAv1_1Abi/BondFixedExpSDAv1_1Abi";
import {BondFixedTermSDAv1_1Abi} from "../generated/BondFixedTermSDAv1_1Abi/BondFixedTermSDAv1_1Abi";

export function createBondPurchase(
  id: BigInt,
  txHash: Bytes,
  purchaseAmount: BigInt,
  payoutAmount: BigInt,
  from: Address,
  referrer: Address,
  timestamp: BigInt
): void {
  const aggregator = AggregatorAbi.bind(Address.fromString("0x007A66A2a13415DB3613C1a4dd1C942A285902d1"));

  const getAuctioneer = aggregator.try_getAuctioneer(id);
  if (getAuctioneer.reverted) {
    throw new Error("Auctioneer not found " + id.toString() + " " + aggregator._name);
  }
  const auctioneerAddress = getAuctioneer.value;

  let bondPurchase = BondPurchase.load(txHash.toHexString());
  if (!bondPurchase) {
    bondPurchase = new BondPurchase(txHash.toHexString());
  }

  const network = dataSource.network();
  const chainId = CHAIN_IDS.get(network).toString();

  let marketId: string;
  let marketPrice: BigDecimal;
  if (
    auctioneerAddress.toHexString().toLowerCase() == "0x007F7A1cb838A872515c8ebd16bE4b14Ef43a222".toLowerCase()
  ) {
    const auctioneer = BondFixedTermCDAAbi.bind(auctioneerAddress);
    marketId = chainId + "_BondFixedTermCDA_" + id.toString();
    marketPrice = BigDecimal.fromString(auctioneer.marketPrice(id).toString());
  } else if (
    auctioneerAddress.toHexString().toLowerCase() == "0x007FEA32545a39Ff558a1367BBbC1A22bc7ABEfD".toLowerCase()
  ) {
    const auctioneer = BondFixedExpCDAAbi.bind(auctioneerAddress);
    marketId = chainId + "_BondFixedExpCDA_" + id.toString();
    marketPrice = BigDecimal.fromString(auctioneer.marketPrice(id).toString());
  } else if (
    auctioneerAddress.toHexString().toLowerCase() == "0xFE05DA9fffc72027C26E2327A9e6339670CD1b90".toLowerCase()
  ) {
    const auctioneer = BondFixedExpOSDAAbi.bind(auctioneerAddress);
    marketId = chainId + "_BondFixedExpOSDA_" + id.toString();
    marketPrice = BigDecimal.fromString(auctioneer.marketPrice(id).toString());
  } else if (
    auctioneerAddress.toHexString().toLowerCase() == "0xF705DA9476a172408e1B94b2A7B2eF595A91C29b".toLowerCase()
  ) {
    const auctioneer = BondFixedTermOSDAAbi.bind(auctioneerAddress);
    marketId = chainId + "_BondFixedTermOSDA_" + id.toString();
    marketPrice = BigDecimal.fromString(auctioneer.marketPrice(id).toString());
  } else if (
    auctioneerAddress.toHexString().toLowerCase() == "0xFE0FDA5406Ef715f6cE35B6550A45c4b2c4069e4".toLowerCase()
  ) {
    const auctioneer = BondFixedExpOFDAAbi.bind(auctioneerAddress);
    marketId = chainId + "_BondFixedExpOFDA_" + id.toString();
    marketPrice = BigDecimal.fromString(auctioneer.marketPrice(id).toString());
  } else if (
    auctioneerAddress.toHexString().toLowerCase() == "0xF70FDA8bc3F30FE36cA3d63bcD0E75024c2371c7".toLowerCase()
  ) {
    const auctioneer = BondFixedTermOFDAAbi.bind(auctioneerAddress);
    marketId = chainId + "_BondFixedTermOFDA_" + id.toString();
    marketPrice = BigDecimal.fromString(auctioneer.marketPrice(id).toString());
  } else if (
    auctioneerAddress.toHexString().toLowerCase() == "0xFEF9A53AA10Ce2C9Ab6519AEE7DF82767F504f55".toLowerCase()
  ) {
    const auctioneer = BondFixedExpFPAAbi.bind(auctioneerAddress);
    marketId = chainId + "_BondFixedExpFPA_" + id.toString();
    marketPrice = BigDecimal.fromString(auctioneer.marketPrice(id).toString());
  } else if (
    auctioneerAddress.toHexString().toLowerCase() == "0xF7F9A96cDBFEFd70BDa14a8f30EC503b16bCe9b1".toLowerCase()
  ) {
    const auctioneer = BondFixedTermFPAAbi.bind(auctioneerAddress);
    marketId = chainId + "_BondFixedTermFPA_" + id.toString();
    marketPrice = BigDecimal.fromString(auctioneer.marketPrice(id).toString());
  } else if (
    auctioneerAddress.toHexString().toLowerCase() == "0xFE5DA6ad5720237D19229e7416791d390255E9AA".toLowerCase()
  ) {
    const auctioneer = BondFixedExpSDAv1_1Abi.bind(auctioneerAddress);
    marketId = chainId + "_BondFixedTermSDA_" + id.toString();
    marketPrice = BigDecimal.fromString(auctioneer.marketPrice(id).toString());
  } else if (
    auctioneerAddress.toHexString().toLowerCase() == "0xF75DAFffaF63f5D935f8A481EE827d68974FD992".toLowerCase()
  ) {
    const auctioneer = BondFixedTermSDAv1_1Abi.bind(auctioneerAddress);
    marketId = chainId + "_BondFixedTermSDA_" + id.toString();
    marketPrice = BigDecimal.fromString(auctioneer.marketPrice(id).toString());
  } else {
    throw new Error("ABI not found for " + auctioneerAddress.toHexString() + " " + id.toString() + " " + auctioneerAddress.toHexString().toLowerCase() + " " + "0x007FEA32545a39Ff558a1367BBbC1A22bc7ABEfD".toLowerCase());
  }

  const market = Market.load(marketId);
  if (!market) {
    log.warning("No market found for id {}", [marketId]);
    return;
  }

  const quoteToken = Token.load(market.quoteToken);
  if (!quoteToken) return;
  const payoutToken = Token.load(market.payoutToken);
  if (!payoutToken) return;

  const ownerTokenTbvId = chainId + "_" + market.owner.toString() + "_" + market.quoteToken.toString();
  let ownerTokenTbv = OwnerTokenTbv.load(ownerTokenTbvId);
  if (!ownerTokenTbv) {
    ownerTokenTbv = new OwnerTokenTbv(ownerTokenTbvId);
    ownerTokenTbv.tbv = BigDecimal.zero();
  }

  const purchaseAmt = BigDecimal.fromString((parseInt(purchaseAmount.toString()) / Math.pow(10, parseInt(quoteToken.decimals.toString()))).toString()).toString();

  const payoutDecimals: u8 = payoutToken.decimals.toI32() as u8;
  const quoteDecimals: u8 = quoteToken.decimals.toI32() as u8;

  const baseScale = BigInt.fromI32(10).pow(
    36 + payoutDecimals - quoteDecimals
  );
  const baseScaleDecimal = BigDecimal.fromString(baseScale.toString());

  let price: BigDecimal;
  if (market.scale) {
    const marketScaleDecimal = BigDecimal.fromString(market.scale!.toString());
    const shift: BigDecimal = baseScaleDecimal.div(marketScaleDecimal);
    price = marketPrice.times(shift);
  } else {
    price = marketPrice;
  }

  const postPurchasePrice = price.div(BigDecimal.fromString(Math.pow(10, 36).toString()));

  ownerTokenTbv.owner = market.owner.toString();
  ownerTokenTbv.token = market.quoteToken.toString();
  ownerTokenTbv.tbv = ownerTokenTbv.tbv.plus(BigDecimal.fromString(purchaseAmt));
  ownerTokenTbv.network = network;
  ownerTokenTbv.chainId = BigInt.fromString(chainId);

  ownerTokenTbv.save();

  bondPurchase.marketId = marketId;
  bondPurchase.owner = market.owner;
  bondPurchase.amount = BigDecimal.fromString(purchaseAmt);
  bondPurchase.payout = BigDecimal.fromString((parseInt(payoutAmount.toString()) / Math.pow(10, parseInt(payoutToken.decimals.toString()))).toString());
  bondPurchase.recipient = from.toHexString();
  bondPurchase.referrer = referrer.toHexString();
  bondPurchase.timestamp = timestamp;
  bondPurchase.teller = market.teller;
  bondPurchase.auctioneer = market.auctioneer;
  bondPurchase.payoutToken = payoutToken.id;
  bondPurchase.quoteToken = quoteToken.id;
  bondPurchase.network = network;
  bondPurchase.chainId = BigInt.fromString(chainId);
  bondPurchase.purchasePrice = bondPurchase.payout.gt(BigDecimal.fromString("0"))
    ? bondPurchase.amount.div(bondPurchase.payout)
    : BigDecimal.fromString("0");
  bondPurchase.postPurchasePrice = postPurchasePrice;
  bondPurchase.ownerTokenTbv = ownerTokenTbvId;

  bondPurchase.save();

  market.totalBondedAmount = market.totalBondedAmount.plus(bondPurchase.amount);
  market.totalPayoutAmount = market.totalPayoutAmount.plus(bondPurchase.payout);

  market.save();

  let uniqueBonder = UniqueBonder.load(
    chainId +
    "_" +
    market.owner.toString() +
    "__" +
    from.toHexString()
  );

  if (!uniqueBonder) {
    uniqueBonder = new UniqueBonder(
      chainId +
      "_" +
      market.owner.toString() +
      "__" +
      from.toHexString()
    );
  }

  uniqueBonder.save();

  let purchaseCount = PurchaseCount.load("purchase-count");
  if (!purchaseCount) {
    purchaseCount = new PurchaseCount("purchase-count");
    purchaseCount.count = BigInt.zero();
  }
  purchaseCount.count = purchaseCount.count.plus(BigInt.fromString("1"));
  purchaseCount.save();
}

export function createBondToken(
  bondToken: string,
  underlying: Address,
  expiry: BigInt,
  teller: Address,
  type: string,
  decimals: BigInt = BigInt.zero(),
  symbol: string = ""
): void {
  const token = new BondToken(bondToken);

  const network = dataSource.network();
  const chainId = CHAIN_IDS.get(network).toString();

  const underlyingToken = loadOrAddERC20Token(underlying);

  token.underlying = underlyingToken.id;
  token.expiry = expiry;
  token.teller = teller.toHexString();
  token.network = network;
  token.chainId = BigInt.fromString(chainId);
  token.type = type;
  token.decimals = decimals.gt(BigInt.zero()) ? decimals : null;
  token.symbol = symbol.length > 0 ? symbol : null;

  token.save();
}
