import {
  BondPurchase,
  BondToken,
  Market,
  OwnerTokenTbv,
  PayoutTokenTbv,
  PurchaseCount,
  Token,
  UniqueBonder,
  UniqueBonderCount,
  UniqueTokenBonder,
  UniqueTokenBonderCount
} from "../generated/schema";
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
  const aggregator = AggregatorAbi.bind(Address.fromString("0x007a66A2a13415DB3613C1a4dd1C942A285902d1"));

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
    auctioneerAddress.toHexString().toLowerCase() == "0xFE0FDA2ACB13249099E5edAc64439ac76C7eF4B6".toLowerCase()
  ) {
    const auctioneer = BondFixedExpOFDAAbi.bind(auctioneerAddress);
    marketId = chainId + "_BondFixedExpOFDA_" + id.toString();
    marketPrice = BigDecimal.fromString(auctioneer.marketPrice(id).toString());
  } else if (
    auctioneerAddress.toHexString().toLowerCase() == "0xF70FDAae514a8b48B83caDa51C0847B46Bb698bd".toLowerCase()
  ) {
    const auctioneer = BondFixedTermOFDAAbi.bind(auctioneerAddress);
    marketId = chainId + "_BondFixedTermOFDA_" + id.toString();
    marketPrice = BigDecimal.fromString(auctioneer.marketPrice(id).toString());
  } else if (
    auctioneerAddress.toHexString().toLowerCase() == "0xFEF9A527ac84836DC9939Ad75eb8ce325bBE0E54".toLowerCase() ||
    auctioneerAddress.toHexString().toLowerCase() == "0xFEF9A53AA10Ce2C9Ab6519AEE7DF82767F504f55".toLowerCase()
  ) {
    const auctioneer = BondFixedExpFPAAbi.bind(auctioneerAddress);
    marketId = chainId + "_BondFixedExpFPA_" + id.toString();
    marketPrice = BigDecimal.fromString(auctioneer.marketPrice(id).toString());
  } else if (
    auctioneerAddress.toHexString().toLowerCase() == "0xF7F9Ae2415F8Cb89BEebf9662A19f2393e7065e0".toLowerCase() ||
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
    log.warning("ABI not found for Chain: {} Auctioneer: {} Market ID: {}", [
      chainId,
      auctioneerAddress.toHexString().toLowerCase(),
      id.toString()
    ]);
    return;
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

  const payoutTokenTbvId = chainId + "_" + market.payoutToken.toString() + "_" + market.quoteToken.toString();
  let payoutTokenTbv = PayoutTokenTbv.load(payoutTokenTbvId);
  if (!payoutTokenTbv) {
    payoutTokenTbv = new PayoutTokenTbv(payoutTokenTbvId);
    payoutTokenTbv.tbv = BigDecimal.zero();
  }

  payoutTokenTbv.payoutToken = market.payoutToken;
  payoutTokenTbv.quoteToken = market.quoteToken;
  payoutTokenTbv.tbv = payoutTokenTbv.tbv.plus(BigDecimal.fromString(purchaseAmt));
  payoutTokenTbv.network = network;
  payoutTokenTbv.chainId = BigInt.fromString(chainId);

  payoutTokenTbv.save();

  const payout = BigDecimal.fromString((parseInt(payoutAmount.toString()) / Math.pow(10, parseInt(payoutToken.decimals.toString()))).toString());

  payoutToken.totalPayoutAmount = payoutToken.totalPayoutAmount.plus(payout);
  payoutToken.purchaseCount = payoutToken.purchaseCount.plus(BigInt.fromI32(1));
  payoutToken.save();

  bondPurchase.marketId = marketId;
  bondPurchase.owner = market.owner;
  bondPurchase.amount = BigDecimal.fromString(purchaseAmt);
  bondPurchase.payout = payout;
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

    let uniqueBonderCount = UniqueBonderCount.load(market.owner.toString());

    if (!uniqueBonderCount) {
      uniqueBonderCount = new UniqueBonderCount(market.owner.toString());
      uniqueBonderCount.count = BigInt.zero();
    }
    uniqueBonderCount.count = uniqueBonderCount.count.plus(BigInt.fromI32(1));
    uniqueBonderCount.save();
  }

  uniqueBonder.save();

  let uniqueTokenBonder = UniqueTokenBonder.load(
    chainId +
    "_" +
    market.payoutToken +
    "__" +
    from.toHexString()
  );

  if (!uniqueTokenBonder) {
    uniqueTokenBonder = new UniqueTokenBonder(
      chainId +
      "_" +
      market.payoutToken +
      "__" +
      from.toHexString()
    );

    let uniqueTokenBonderCount = UniqueTokenBonderCount.load(payoutToken.id.toString());

    if (!uniqueTokenBonderCount) {
      uniqueTokenBonderCount = new UniqueTokenBonderCount(payoutToken.id.toString());
      uniqueTokenBonderCount.count = BigInt.zero();
      uniqueTokenBonderCount.token = payoutToken.id;
    }
    uniqueTokenBonderCount.count = uniqueTokenBonderCount.count.plus(BigInt.fromI32(1));
    uniqueTokenBonderCount.save();
  }

  uniqueTokenBonder.save();

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

  const underlyingToken = loadOrAddERC20Token(underlying, false, false);

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
