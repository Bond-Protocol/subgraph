## Deployment Steps

1. Update/add addresses in `networks.json`
2. Run `yarn graph codegen` if updating handlers
3. Run `yarn graph build --<NETWORK_NAME>` (or add as a command to package.json)

3.a For graph hosted services, run deploy script for target network. I.e. for polygon-mumbai run: `yarn deploy-polygon-mumbai`
3.b For Alchemy subgraph there's a single deploy script. I.e for base-sepolia `yarn deploy-alchemy base-sepolia 0.0.7 <your_access_token>`
3.c For Goldsky run `yarn goldsky deploy bond-protocol-<NETWORK_NAME>/<VERSION>`

## Deployment Permissions

- For The Graph you must be an admin role in the BP github organization
- For Alchemy you have to setup an access token
- For Goldsky you have to authenticate with the cli (`yarn goldsky login`), setup an access token in their dashboard

## Notes

- Base subgraph is deployed on Alchemy Subgraphs, check [docs here](https://docs.alchemy.com/reference/subgraphs-quickstart)
