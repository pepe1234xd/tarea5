import type { Callback, Callee, TestName, Thrower } from "./types";

const noop: (...args: any[]) => any = () => {};
export default function createCallee<T extends TestName>(
  key: T,
  cb: Callback<T>,
  th?: Thrower,
): Callee<T> {
  return { key, cb, th: th ? th : noop };
}
