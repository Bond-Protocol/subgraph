# Bond Protocol Subgraph

This repo features subgraph handlers and definitions for Bond Protocol smart contracts.

## Deployments

### Mainnets

| Chain    | URL                                                                    |
| -------- | ---------------------------------------------------------------------- |
| ethereum | <https://thegraph.com/studio/subgraph/bond-protocol-ethereum/>         |
| base     | <https://thegraph.com/studio/subgraph/bond-protocol-base/>             |
| arbitrum | <https://thegraph.com/studio/subgraph/bond-protocol-arbitrum-mainnet/> |
| polygon  | <https://thegraph.com/studio/subgraph/bond-protocol-polygon/>          |
| optimism | <https://thegraph.com/studio/subgraph/bond-protocol-optimism/>         |
| bsc      | <https://thegraph.com/studio/subgraph/bond-protocol-bsc/>              |
| sonic    | <https://thegraph.com/studio/subgraph/bond-protocol-sonic/>            |

### Testnets

| Chain        | URL                                                                |
| ------------ | ------------------------------------------------------------------ |
| base-sepolia | <https://thegraph.com/studio/subgraph/bond-protocol-base-sepolia/> |

## Deployment Steps

1. Update/add addresses in `networks.json`
2. Add chain id in `src/chain-ids`
3. Map chain id to addresses in `src-address-map`
4. Run `yarn graph codegen` if updating handlers
5. Run `yarn graph build <NETWORK_NAME>`
6. Run `yarn graph deploy <NETWORK_NAME>`

For Alchemy subgraph there's a single deploy script, you'll need an Alchemy access token. I.e for base-sepolia `yarn deploy-alchemy base-sepolia 0.0.7 <your_access_token>`.
