import {
  ApprovalForAll,
  AuthorityUpdated,
  Bonded,
  ERC1155BondTokenCreated,
  OwnerUpdated,
  TransferBatch,
  TransferSingle
} from "../generated/BondFixedTermTeller/BondFixedTermTeller"
import {BondToken, OwnerBalance} from "../generated/schema";
import {BigInt, dataSource} from "@graphprotocol/graph-ts";
import {BondFixedTermCDA} from "../generated/BondFixedTermCDA/BondFixedTermCDA";
import {createBondPurchase} from "./teller-common";

export function handleApprovalForAll(event: ApprovalForAll): void {
}

export function handleAuthorityUpdated(event: AuthorityUpdated): void {
}

export function handleBonded(event: Bonded): void {
  createBondPurchase(
    event.params.id,
    event.transaction.hash,
    dataSource.network(),
    "BondFixedTermCDA",
    event.params.amount,
    event.params.payout,
    event.transaction.from,
    event.params.referrer,
    event.block.timestamp
  );
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
