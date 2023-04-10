import type { ParseContext } from "../types.js";

const defaultContext: Omit<ParseContext, "reset"> = {
  index: 0,
  slength: 0,
  startIndex: 0,
  errorIndex: 0,
  isQuoted: false,
  line: "",
  isJSON: false,
  shouldTransform: false,
  pointer: {
    x: 0,
    y: 0,
  },
};

export const context: ParseContext = {
  ...defaultContext,
  reset() {
    const clone = JSON.parse(JSON.stringify(defaultContext));
    const keys = Object.keys(clone);
    for (let i = 0; i < keys.length; i++) {
      (this as any)[keys[i]] = clone[keys[i]];
    }
  },
};
