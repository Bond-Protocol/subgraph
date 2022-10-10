import {
  AuthorityUpdated,
  Bonded,
  ERC20BondTokenCreated,
  OwnerUpdated,
} from "../generated/BondFixedExpTeller/BondFixedExpTeller"
import {BondPurchase, BondToken, Market, Token, UniqueBonder} from "../generated/schema";
import {BigDecimal, dataSource} from "@graphprotocol/graph-ts";

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
  const quoteToken = Token.load(market.quoteToken);
  if (!quoteToken) return;
  const payoutToken = Token.load(market.payoutToken);
  if (!payoutToken) return;

  bondPurchase.marketId = marketId;
  bondPurchase.owner = market.owner;
  bondPurchase.amount = BigDecimal.fromString((parseInt(event.params.amount.toString()) / Math.pow(10, parseInt(quoteToken.decimals.toString()))).toString());
  bondPurchase.payout = BigDecimal.fromString((parseInt(event.params.payout.toString()) / Math.pow(10, parseInt(payoutToken.decimals.toString()))).toString());
  bondPurchase.recipient = event.transaction.from.toHexString();
  bondPurchase.referrer = event.params.referrer.toHexString();
  bondPurchase.timestamp = event.block.timestamp;
  bondPurchase.teller = market.teller.toHexString();
  bondPurchase.auctioneer = market.auctioneer.toHexString();
  bondPurchase.payoutToken = payoutToken.id;
  bondPurchase.quoteToken = quoteToken.id;

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

  bondToken.underlying = dataSource.network() + "_" + event.params.underlying.toHexString();
  bondToken.expiry = event.params.expiry;
  bondToken.teller = event.address;
  bondToken.network = dataSource.network();
  bondToken.type = "fixed-expiration";

  bondToken.save();
}

export function handleOwnerUpdated(event: OwnerUpdated): void {
}
