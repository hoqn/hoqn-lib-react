import { MurmurHash3 } from "murmurhash-wasm";

const seed = 20242024;

export function hash(value: string) {
  return MurmurHash3.hash32(value, seed).toString("hex");
}
