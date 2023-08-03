import { ValueObject } from "./types";

const JSON_PROTOTYPE = Object.getPrototypeOf({});

/**
 * Checks if the passed value is a valid ValueObject that only contains:
 * - Text
 * - Booleans
 * - Numbers
 * - Objects or Arrays containing the previous ones
 */
export function isValueObject(value: any): value is ValueObject {
  if (value === null) return true;
  const type = typeof value;
  if (
    type === "string" ||
    type === "number" ||
    type === "bigint" ||
    type === "boolean"
  ) {
    return true;
  } else if (type === "function" || type === "symbol" || type === "undefined") {
    return false;
  } else {
    if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        const isValid = isValueObject(value[i]);
        if (!isValid) return false;
      }
    } else {
      if (Object.getPrototypeOf(value) === JSON_PROTOTYPE) {
        let entries = Object.entries(value);
        for (let i = 0; i < entries.length; i++) {
          const isValid = isValueObject(entries[i][1]);
          if (!isValid) return false;
        }
      } else return false;
    }
    return true;
  }
}
