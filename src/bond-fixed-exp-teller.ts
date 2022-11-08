import {
  AuthorityUpdated,
  Bonded,
  ERC20BondTokenCreated,
  OwnerUpdated,
} from "../generated/BondFixedExpTeller/BondFixedExpTeller"
import {BondPurchase, BondToken, Market, OwnerTokenTbv, Token, UniqueBonder} from "../generated/schema";
import {Address, BigDecimal, BigInt, dataSource} from "@graphprotocol/graph-ts";
import {ERC20} from "../generated/templates/ERC20/ERC20";
import {BondFixedExpCDA} from "../generated/BondFixedExpCDA/BondFixedExpCDA";

export function handleAuthorityUpdated(event: AuthorityUpdated): void {
}

export function handleBonded(event: Bonded): void {
  let bondPurchase = BondPurchase.load(event.transaction.hash);

  if (!bondPurchase) {
    bondPurchase = new BondPurchase(event.transaction.hash);
  }
  const marketId = dataSource.network() + "_BondFixedExpCDA_" + event.params.id.toString();
  const market = Market.load(marketId);
  if (!market) return;
  const auctioneer = BondFixedExpCDA.bind(Address.fromBytes(market.auctioneer));

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
  bondPurchase.network = dataSource.network();
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

export function handleERC20BondTokenCreated(event: ERC20BondTokenCreated): void {
  let bondToken = new BondToken(event.params.bondToken.toHexString());
  let bondTokenContract = ERC20.bind(event.params.bondToken);

  bondToken.decimals = bondTokenContract.decimals();
  bondToken.symbol = bondTokenContract.symbol();
  bondToken.underlying = dataSource.network() + "_" + event.params.underlying.toHexString();
  bondToken.expiry = event.params.expiry;
  bondToken.teller = event.address.toHexString();
  bondToken.network = dataSource.network();
  bondToken.type = "fixed-expiration";

  bondToken.save();
}

export function handleOwnerUpdated(event: OwnerUpdated): void {
}
