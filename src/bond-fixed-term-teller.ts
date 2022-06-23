import { BigInt } from "@graphprotocol/graph-ts"
import {
  BondFixedTermTeller,
  ApprovalForAll,
  AuthorityUpdated,
  Bonded,
  ERC1155BondTokenCreated,
  OwnerUpdated,
  TransferBatch,
  TransferSingle
} from "../generated/BondFixedTermTeller/BondFixedTermTeller"
import { ExampleEntity } from "../generated/schema"

export function handleApprovalForAll(event: ApprovalForAll): void {
  // Entities can be loaded from the store using a string ID; this ID
  // needs to be unique across all entities of the same type
  let entity = ExampleEntity.load(event.transaction.from.toHex())

  // Entities only exist after they have been saved to the store;
  // `null` checks allow to create entities on demand
  if (!entity) {
    entity = new ExampleEntity(event.transaction.from.toHex())

    // Entity fields can be set using simple assignments
    entity.count = BigInt.fromI32(0)
  }

  // BigInt and BigDecimal math are supported
  entity.count = entity.count + BigInt.fromI32(1)

  // Entity fields can be set based on event parameters
  entity.owner = event.params.owner
  entity.operator = event.params.operator

  // Entities can be written to the store with `.save()`
  entity.save()

  // Note: If a handler doesn't require existing field values, it is faster
  // _not_ to load the entity from the store. Instead, create it fresh with
  // `new Entity(...)`, set the fields that should be updated and save the
  // entity back to the store. Fields that were not set or unset remain
  // unchanged, allowing for partial updates to be applied.

  // It is also possible to access smart contracts from mappings. For
  // example, the contract that has emitted the event can be connected to
  // with:
  //
  // let contract = Contract.bind(event.address)
  //
  // The following functions can then be called on this contract to access
  // state variables and other data:
  //
  // - contract.FEE_DECIMALS(...)
  // - contract.authority(...)
  // - contract.balanceOf(...)
  // - contract.balanceOfBatch(...)
  // - contract.create(...)
  // - contract.createFeeDiscount(...)
  // - contract.deploy(...)
  // - contract.getFee(...)
  // - contract.getTokenId(...)
  // - contract.getTokenNameAndSymbol(...)
  // - contract.isApprovedForAll(...)
  // - contract.owner(...)
  // - contract.protocolFee(...)
  // - contract.purchase(...)
  // - contract.referrerFees(...)
  // - contract.rewards(...)
  // - contract.supportsInterface(...)
  // - contract.tokenMetadata(...)
}

export function handleAuthorityUpdated(event: AuthorityUpdated): void {}

export function handleBonded(event: Bonded): void {}

export function handleERC1155BondTokenCreated(
  event: ERC1155BondTokenCreated
): void {}

export function handleOwnerUpdated(event: OwnerUpdated): void {}

export function handleTransferBatch(event: TransferBatch): void {}

export function handleTransferSingle(event: TransferSingle): void {}
