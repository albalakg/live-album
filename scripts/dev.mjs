import { spawn } from "node:child_process";

const marketing = "http://localhost:4321";
const app = "http://localhost:8080";

console.log("");
console.log("  Marketing site   " + marketing);
console.log("  App (Vue)        " + app);
console.log("");
console.log("  Open the marketing site for the public homepage.");
console.log("  The app serves login, order, events, and albums.");
console.log("  Visiting " + app + "/ redirects to the marketing site.");
console.log("");

const child = spawn(
  "pnpm",
  [
    "--parallel",
    "--filter",
    "@snapshare/marketing",
    "--filter",
    "@snapshare/web",
    "dev",
  ],
  { stdio: "inherit", shell: true }
);

child.on("exit", (code) => process.exit(code ?? 0));
