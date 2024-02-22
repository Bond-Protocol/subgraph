/**
 * Script for alchemy subgraph deployment
 * Usage: pnpm deploy-graph <name> <version> <deployKey>
 * Example: pnpm deploy-graph base-sepolia 0.0.7 d3710yk31
 * */
const { spawn } = require("child_process");
const node = "https://subgraphs.alchemy.com/api/subgraphs/deploy";
const ipfs = "https://ipfs.satsuma.xyz";
const baseName = "bond-protocol";

function makeCommand(name, version, deployKey) {
  return `graph deploy ${baseName}-${name} \
  --version-label v${version} \
  --node ${node} \
  --deploy-key ${deployKey} \
  --ipfs ${ipfs} \ `;
}

function executeCommand(command) {
  const childProcess = spawn(command, { shell: true });

  childProcess.stdout.on("data", data => console.log(data.toString("utf-8")));

  childProcess.stderr.on("data", data => console.error(data.toString("utf-8")));

  childProcess.on("error", error => console.error(error.message));

  childProcess.on("close", code =>
    console.log(`Child process exited with code ${code}`)
  );
}

const [, , name, version, deployKey] = process.argv;

if (!name || !version || !deployKey) {
  console.error("Usage: pnpm deploy-graph <name> <version> <deployKey>");
  process.exit(1);
}

const command = makeCommand(name, version, deployKey);
executeCommand(command);
