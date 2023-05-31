import {Address, BigDecimal, BigInt, dataSource} from "@graphprotocol/graph-ts";
import {Token} from "../generated/schema";
import {ERC20Abi} from "../generated/templates/ERC20Abi/ERC20Abi";
import {CHAIN_IDS} from "./chain-ids";

export function loadOrAddERC20Token(address: Address, saveAsPayout: boolean, saveAsQuote: boolean): Token {
  const addressAsString = address.toHexString().toLowerCase();
  const tokenId = CHAIN_IDS.get(dataSource.network()).toString() + "_" + addressAsString;

  const tokenContract = ERC20Abi.bind(address);
  let token = Token.load(tokenId);

  if (!token) {
    token = new Token(tokenId);
    token.network = dataSource.network();
    token.chainId = BigInt.fromI32(CHAIN_IDS.get(dataSource.network()));
    token.address = addressAsString;
    token.decimals = tokenContract.decimals();
    token.symbol = tokenContract.symbol();
    token.name = tokenContract.name();
    token.typeName = "ERC20";
    token.usedAsPayout = false;
    token.usedAsQuote = false;
    token.totalPayoutAmount = BigDecimal.zero();
    token.purchaseCount = BigInt.zero();
  }

  if (saveAsPayout) {
    token.usedAsPayout = true;
  }

  if (saveAsQuote) {
    token.usedAsQuote = true;
  }
  token.save();

  return token;
}
