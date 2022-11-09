import {
  ApprovalForAll,
  AuthorityUpdated,
  Bonded,
  ERC1155BondTokenCreated,
  OwnerUpdated,
  TransferBatch,
  TransferSingle
} from "../generated/BondFixedTermTeller/BondFixedTermTeller"
import {BondPurchase, BondToken, Market, OwnerBalance, OwnerTokenTbv, Token, UniqueBonder} from "../generated/schema";
import {Address, BigDecimal, BigInt, dataSource} from "@graphprotocol/graph-ts";
import {BondFixedTermCDA} from "../generated/BondFixedTermCDA/BondFixedTermCDA";

export function handleApprovalForAll(event: ApprovalForAll): void {
}

export function handleAuthorityUpdated(event: AuthorityUpdated): void {
}

export function handleBonded(event: Bonded): void {
  let bondPurchase = BondPurchase.load(event.transaction.hash);

  if (!bondPurchase) {
    bondPurchase = new BondPurchase(event.transaction.hash);
  }
  const marketId = dataSource.network() + "_BondFixedTermCDA_" + event.params.id.toString();
  const market = Market.load(marketId);
  if (!market) return;

  const auctioneer = BondFixedTermCDA.bind(Address.fromBytes(market.auctioneer));

  const quoteToken = Token.load(market.quoteToken);
  if (!quoteToken) return;
  const payoutToken = Token.load(market.payoutToken);
  if (!payoutToken) return;

  const ownerTokenTbvId =
    dataSource.network() +
    "_" +
    market.owner.toString() +
    "_" +
    market.quoteToken.toString();

  let ownerTokenTbv = OwnerTokenTbv.load(ownerTokenTbvId);

  if (!ownerTokenTbv) {
    ownerTokenTbv = new OwnerTokenTbv(ownerTokenTbvId);
    ownerTokenTbv.tbv = BigDecimal.zero();
  }

  const amount = BigDecimal.fromString((parseInt(event.params.amount.toString()) / Math.pow(10, parseInt(quoteToken.decimals.toString()))).toString()).toString();

  const payoutDecimals: u8 = payoutToken.decimals.toI32() as u8;
  const quoteDecimals: u8 = quoteToken.decimals.toI32() as u8;

  const baseScale = BigInt.fromI32(10).pow(
    36 + payoutDecimals - quoteDecimals
  );
  const marketScale = auctioneer.marketScale(market.marketId);
  const shift = BigDecimal.fromString(baseScale.div(marketScale).toString());
  const marketPrice: BigDecimal = BigDecimal.fromString(auctioneer.marketPrice(market.marketId).toString());
  const price = marketPrice.times(shift);
  const postPurchasePrice = price.div(BigDecimal.fromString(Math.pow(10, 36).toString()));

  ownerTokenTbv.owner = market.owner.toString();
  ownerTokenTbv.token = market.quoteToken.toString();
  ownerTokenTbv.tbv = ownerTokenTbv.tbv.plus(BigDecimal.fromString(amount));
  ownerTokenTbv.network = dataSource.network();

  ownerTokenTbv.save();

  bondPurchase.marketId = marketId;
  bondPurchase.owner = market.owner;
  bondPurchase.amount = BigDecimal.fromString(amount);
  bondPurchase.payout = BigDecimal.fromString((parseInt(event.params.payout.toString()) / Math.pow(10, parseInt(payoutToken.decimals.toString()))).toString());
  bondPurchase.recipient = event.transaction.from.toHexString();
  bondPurchase.referrer = event.params.referrer.toHexString();
  bondPurchase.timestamp = event.block.timestamp;
  bondPurchase.teller = market.teller.toHexString();
  bondPurchase.auctioneer = market.auctioneer.toHexString();
  bondPurchase.payoutToken = payoutToken.id;
  bondPurchase.quoteToken = quoteToken.id;
  bondPurchase.network = dataSource.network()
  bondPurchase.purchasePrice = bondPurchase.payout.gt(BigDecimal.fromString("0")) ?
    bondPurchase.amount.div(bondPurchase.payout) : BigDecimal.fromString("0");
  bondPurchase.postPurchasePrice = postPurchasePrice;
  bondPurchase.ownerTokenTbv = ownerTokenTbvId;

  bondPurchase.save();

  market.totalBondedAmount = market.totalBondedAmount.plus(bondPurchase.amount);
  market.totalPayoutAmount = market.totalPayoutAmount.plus(bondPurchase.payout);

  market.save();

  let uniqueBonder = UniqueBonder.load(
    dataSource.network() +
    "_" +
    market.owner.toString() +
    "__" +
    event.transaction.from.toHexString()
  );

  if (!uniqueBonder) {
    uniqueBonder = new UniqueBonder(
      dataSource.network() +
      "_" +
      market.owner.toString() +
      "__" +
      event.transaction.from.toHexString()
    );
  }

  uniqueBonder.save();
}

export function handleERC1155BondTokenCreated(event: ERC1155BondTokenCreated): void {
  const bondToken = new BondToken(event.params.tokenId.toString());

  bondToken.underlying = dataSource.network() + "_" + event.params.payoutToken.toHexString();
  bondToken.expiry = event.params.expiry;
  bondToken.teller = event.address.toHexString();
  bondToken.network = dataSource.network();
  bondToken.type = "fixed-term";

  bondToken.save();
}

export function handleOwnerUpdated(event: OwnerUpdated): void {
}

export function handleTransferBatch(event: TransferBatch): void {
}

export function handleTransferSingle(event: TransferSingle): void {
  let ownerBalance = OwnerBalance.load(event.params.to.toHexString() + "_" + event.params.id.toString());
  let prevOwnerBalance = OwnerBalance.load(event.params.from.toHexString() + "_" + event.params.id.toString());

  if (!ownerBalance) {
    ownerBalance = new OwnerBalance(event.params.to.toHexString() + "_" + event.params.id.toString());
    ownerBalance.balance = BigInt.fromI32(0);
  }

  ownerBalance.tokenId = event.params.id;
  ownerBalance.owner = event.params.to.toHexString();
  ownerBalance.balance = ownerBalance.balance.plus(event.params.amount);
  ownerBalance.network = dataSource.network();
  ownerBalance.bondToken = event.params.id.toString();

  ownerBalance.save();

  if (prevOwnerBalance) {
    prevOwnerBalance.balance = prevOwnerBalance.balance.minus(event.params.amount);
    prevOwnerBalance.save();
  }
}
