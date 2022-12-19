import {BondPurchase, Market, OwnerTokenTbv, Token, UniqueBonder} from "../generated/schema";
import {Address, BigDecimal, BigInt, Bytes} from "@graphprotocol/graph-ts";
import {Auctioneer} from "../generated/templates/Auctioneer/Auctioneer";

export function createBondPurchase(
  id: BigInt,
  txHash: Bytes,
  network: string,
  auctioneerName: string,
  purchaseAmount: BigInt,
  payoutAmount: BigInt,
  from: Address,
  referrer: Address,
  timestamp: BigInt
): void {
  let bondPurchase = BondPurchase.load(txHash.toHexString());
  if (!bondPurchase) {
    bondPurchase = new BondPurchase(txHash.toHexString());
  }

  const marketId = network + "_" + auctioneerName + "_" + id.toString();
  const market = Market.load(marketId);
  if (!market) return;

  const auctioneer = Auctioneer.bind(Address.fromString(market.auctioneer));

  const quoteToken = Token.load(market.quoteToken);
  if (!quoteToken) return;
  const payoutToken = Token.load(market.payoutToken);
  if (!payoutToken) return;

  const ownerTokenTbvId = network + "_" + market.owner.toString() + "_" + market.quoteToken.toString();
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

  const marketScale = auctioneer.marketScale(market.marketId);
  const marketScaleDecimal = BigDecimal.fromString(marketScale.toString());
  const shift: BigDecimal = baseScaleDecimal.div(marketScaleDecimal);
  const marketPrice: BigDecimal = BigDecimal.fromString(auctioneer.marketPrice(market.marketId).toString());
  const price = marketPrice.times(shift);
  const postPurchasePrice = price.div(BigDecimal.fromString(Math.pow(10, 36).toString()));

  ownerTokenTbv.owner = market.owner.toString();
  ownerTokenTbv.token = market.quoteToken.toString();
  ownerTokenTbv.tbv = ownerTokenTbv.tbv.plus(BigDecimal.fromString(purchaseAmt));
  ownerTokenTbv.network = network;

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
    network +
    "_" +
    market.owner.toString() +
    "__" +
    from.toHexString()
  );

  if (!uniqueBonder) {
    uniqueBonder = new UniqueBonder(
      network +
      "_" +
      market.owner.toString() +
      "__" +
      from.toHexString()
    );
  }

  uniqueBonder.save();
}
