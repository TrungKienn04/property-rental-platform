const { spawnSync } = require("node:child_process");
const path = require("node:path");

const tasks = [
  {
    name: "client",
    script: path.resolve(__dirname, "client", "test", "run-tests.cjs"),
  },
  {
    name: "server",
    script: path.resolve(__dirname, "server", "test", "run-tests.cjs"),
  },
];

for (const task of tasks) {
  console.log(`\n=== Running ${task.name} tests ===`);

  const result = spawnSync(process.execPath, [task.script], {
    cwd: path.dirname(task.script),
    stdio: "inherit",
  });

  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

console.log("\nAll client + server tests passed.");
