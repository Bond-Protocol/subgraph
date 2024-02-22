## Deployment Steps

1. Update/add addresses in `networks.json`
2. Run `yarn graph codegen`
3. Run deploy script for target network. I.e. for polygon-mumbai run: `yarn deploy-polygon-mumbai`

## Deployment Permissions

- To deploy you must be an admin role in the BP github organization

## Notes

- Base subgraph is deployed on Alchemy Subgraphs, check [docs here](https://docs.alchemy.com/reference/subgraphs-quickstart)
