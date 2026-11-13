// Makes the ADMIN_PASSWORD_HASH secret for the admin sign-in. The password is read from the
// terminal (not the command line, so it stays out of shell history) and is never stored.
//   node scripts/hash-password.mjs            → prints the hash
//   node scripts/hash-password.mjs | npx wrangler secret put ADMIN_PASSWORD_HASH
import { webcrypto as crypto } from "node:crypto";
import { createInterface } from "node:readline";

const b64url = (b) => Buffer.from(b).toString("base64url");
async function hash(password, iterations = 100_000) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations }, key, 256);
  return `pbkdf2-sha256$${iterations}$${b64url(salt)}$${b64url(new Uint8Array(bits))}`;
}

const password = process.env.ADMIN_PASSWORD ?? (await new Promise((resolve) => {
  const rl = createInterface({ input: process.stdin, output: process.stderr, terminal: true });
  rl._writeToOutput = () => {};
  process.stderr.write("New admin password (at least 12 characters): ");
  rl.question("", (a) => { rl.close(); process.stderr.write("\n"); resolve(a); });
}));
if (password.length < 12) {
  console.error("Please use at least 12 characters.");
  process.exit(1);
}
console.log(await hash(password));
