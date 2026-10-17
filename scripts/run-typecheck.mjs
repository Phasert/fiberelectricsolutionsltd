import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const workdir = resolve(root, "scripts/bun-workdir");

for (const [program, args] of [
  [process.execPath, [resolve(root, "node_modules/next/dist/bin/next"), "typegen", root]],
  [process.execPath, [resolve(root, "node_modules/typescript/bin/tsc"), "--noEmit", "-p", resolve(root, "tsconfig.json")]],
]) {
  const result = spawnSync(program, args, { cwd: workdir, stdio: "inherit", shell: false });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
