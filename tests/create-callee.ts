import type { Callback, TestName } from "./types";

export default function createCallee<T extends TestName>(
  key: T,
  cb: Callback<T>,
) {
  return cb;
}
