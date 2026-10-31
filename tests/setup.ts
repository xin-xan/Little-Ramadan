import "fake-indexeddb/auto";
import "@testing-library/jest-dom/vitest";
import { webcrypto } from "node:crypto";

if (!globalThis.crypto?.subtle) Object.defineProperty(globalThis, "crypto", { value: webcrypto });
if (!globalThis.structuredClone) globalThis.structuredClone = (v: unknown) => JSON.parse(JSON.stringify(v));
