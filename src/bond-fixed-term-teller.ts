import {
  ApprovalForAll,
  AuthorityUpdated,
  Bonded,
  ERC1155BondTokenCreated,
  OwnerUpdated,
  TransferBatch,
  TransferSingle
} from "../generated/BondFixedTermTellerAbi/BondFixedTermTellerAbi";
import { BondPurchase, OwnerBalance } from "../generated/schema";
import { BigInt, dataSource } from "@graphprotocol/graph-ts";
import { createBondPurchase, createBondToken } from "./teller-common";
import { CHAIN_IDS } from "./chain-ids";

export function handleApprovalForAll(event: ApprovalForAll): void {}

export function handleAuthorityUpdated(event: AuthorityUpdated): void {}

export function handleBonded(event: Bonded): void {
  createBondPurchase(
    event.params.id,
    event.transaction.hash,
    event.params.amount,
    event.params.payout,
    event.transaction.from,
    event.params.referrer,
    event.block.timestamp
  );
}

export function handleERC1155BondTokenCreated(
  event: ERC1155BondTokenCreated
): void {
  createBondToken(
    event.params.tokenId.toString(),
    event.params.payoutToken,
    event.params.expiry,
    event.address,
    "fixed-term"
  );
}

export function handleOwnerUpdated(event: OwnerUpdated): void {}

export function handleTransferBatch(event: TransferBatch): void {}

export function handleTransferSingle(event: TransferSingle): void {
  let ownerBalance = OwnerBalance.load(
    event.params.to.toHexString() + "_" + event.params.id.toString()
  );
  let prevOwnerBalance = OwnerBalance.load(
    event.params.from.toHexString() + "_" + event.params.id.toString()
  );

  if (!ownerBalance) {
    ownerBalance = new OwnerBalance(
      event.params.to.toHexString() + "_" + event.params.id.toString()
    );
    ownerBalance.balance = BigInt.fromI32(0);
  }

  ownerBalance.txHash = event.transaction.hash.toHexString();

  ownerBalance.tokenId = event.params.id;
  ownerBalance.owner = event.params.to.toHexString();
  ownerBalance.balance = ownerBalance.balance.plus(event.params.amount);
  ownerBalance.network = dataSource.network();
  ownerBalance.chainId = BigInt.fromI32(CHAIN_IDS.get(dataSource.network()));
  ownerBalance.bondToken = event.params.id.toString();

  ownerBalance.bondPurchase = event.transaction.hash.toHexString();

  ownerBalance.save();

  if (prevOwnerBalance) {
    prevOwnerBalance.balance = prevOwnerBalance.balance.minus(
      event.params.amount
    );
    prevOwnerBalance.save();
  }
}
