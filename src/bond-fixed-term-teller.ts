import {
  ApprovalForAll,
  AuthorityUpdated,
  Bonded,
  ERC1155BondTokenCreated,
  OwnerUpdated,
  TransferBatch,
  TransferSingle
} from "../generated/BondFixedTermTeller/BondFixedTermTeller"
import {BondPurchase, Erc1155BondToken} from "../generated/schema";
import {dataSource} from "@graphprotocol/graph-ts";

export function handleApprovalForAll(event: ApprovalForAll): void {
}

export function handleAuthorityUpdated(event: AuthorityUpdated): void {
}

export function handleBonded(event: Bonded): void {
  let bondPurchase = BondPurchase.load(event.transaction.hash);

  if (!bondPurchase) {
    bondPurchase = new BondPurchase(event.transaction.hash);
  }

  bondPurchase.marketId = event.params.id;
  bondPurchase.amount = event.params.amount;
  bondPurchase.payout = event.params.payout;
  bondPurchase.recipient = event.transaction.from;
  bondPurchase.referrer = event.params.referrer;
  bondPurchase.timestamp = event.block.timestamp;

  bondPurchase.save();
}

export function handleERC1155BondTokenCreated(event: ERC1155BondTokenCreated): void {
  let bondToken = new Erc1155BondToken(event.transaction.hash);
  bondToken.tokenId = event.params.tokenId;
  bondToken.underlying = event.params.payoutToken;
  bondToken.expiry = event.params.expiry;
  bondToken.owner = event.transaction.from;
  bondToken.teller = event.address;
  bondToken.network = dataSource.network();

  bondToken.save();
}

export function handleOwnerUpdated(event: OwnerUpdated): void {
}

export function handleTransferBatch(event: TransferBatch): void {
}

export function handleTransferSingle(event: TransferSingle): void {
}
