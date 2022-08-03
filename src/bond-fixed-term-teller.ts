import {
  ApprovalForAll,
  AuthorityUpdated,
  Bonded,
  ERC1155BondTokenCreated,
  OwnerUpdated,
  TransferBatch,
  TransferSingle
} from "../generated/BondFixedTermTeller/BondFixedTermTeller"
import {BondPurchase, BondToken, OwnerBalance} from "../generated/schema";
import {BigInt, dataSource} from "@graphprotocol/graph-ts";

export function handleApprovalForAll(event: ApprovalForAll): void {
}

export function handleAuthorityUpdated(event: AuthorityUpdated): void {
}

export function handleBonded(event: Bonded): void {
  let bondPurchase = BondPurchase.load(event.transaction.hash);

  if (!bondPurchase) {
    bondPurchase = new BondPurchase(event.transaction.hash);
  }

  bondPurchase.marketId = dataSource.network() + "_BondFixedTermCDA_" + event.params.id.toString();
  bondPurchase.amount = event.params.amount;
  bondPurchase.payout = event.params.payout;
  bondPurchase.recipient = event.transaction.from.toHexString();
  bondPurchase.referrer = event.params.referrer.toHexString();
  bondPurchase.timestamp = event.block.timestamp;

  bondPurchase.save();
}

export function handleERC1155BondTokenCreated(event: ERC1155BondTokenCreated): void {
  const bondToken = new BondToken(event.params.tokenId.toString());

  bondToken.underlying = dataSource.network() + "_" + event.params.payoutToken.toHexString();
  bondToken.expiry = event.params.expiry;
  bondToken.teller = event.address;
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
  ownerBalance.bondToken = event.params.id.toString();

  ownerBalance.save();

  if (prevOwnerBalance) {
    prevOwnerBalance.balance = prevOwnerBalance.balance.minus(event.params.amount);
    prevOwnerBalance.save();
  }
}
