import {Address, BigInt, dataSource} from "@graphprotocol/graph-ts";
import {Token} from "../generated/schema";
import {ERC20} from "../generated/templates/ERC20/ERC20";
import {CHAIN_IDS} from "./chain-ids";

export function loadOrAddERC20Token(address: Address): Token {
  const addressAsString = address.toHexString().toLowerCase();
  const tokenId = CHAIN_IDS.get(dataSource.network()).toString() + "_" + addressAsString;

  const tokenContract = ERC20.bind(address);
  let token = Token.load(tokenId);

  if (!token) {
    token = new Token(tokenId);
    token.network = dataSource.network();
    token.chainId = BigInt.fromI32(CHAIN_IDS.get(dataSource.network()));
    token.address = addressAsString;
    token.decimals = tokenContract.decimals();
    token.symbol = tokenContract.symbol();
    token.name = tokenContract.name();
    token.typeName = tokenContract._name;
    token.save();
  }

  return token;
}
