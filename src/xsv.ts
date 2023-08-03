import { setTextFormat, format, setDefaultTextFormat } from "./text-format.js";
import { parse } from "./parser/parse.js";
import { TextFormat } from "./types.js";
import { isValueObject } from "./is-value-object.js";
import { stringify } from "./stringify.js";

// Populates the global text format with a default format
setDefaultTextFormat();

/**
 * @module
 * This module handles CSV format strings, either to parse or read them
 */
const xsv = structuredClone({
  /**
   * Parses a string into a valid Spreadsheet with multiple functions
   */
  parse,
  /**
   * Parses an object into a string with CSV formt currently set
   */
  stringify,
  /**
   * Checks if an element is valid candidate to be a CSV value
   */
  isValueObject,
  /** Gets a copy from the current text format */
  get format(): TextFormat {
    return structuredClone(format);
  },
  /** Sets the text format to be used while parsing */
  set format(v: TextFormat) {
    setTextFormat(v);
  },
});

export default xsv;
