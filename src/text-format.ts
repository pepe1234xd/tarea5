import { TextFormat } from "./types";
import { NotValidEmptyValue } from "./validations";

const EMPTY_SYMBOL = Symbol("empty");
const WINDOWS_BREAK_LINE = "\r\n";
const COMMA_DELIMITER = ",";
const QUOTE_DELIMITER = '"';

/** This is a global format to be stored in case none was passed */
export let format: Required<TextFormat> = undefined as any;

/** Builds the way to handle the text format during parsing */
export function setTextFormat(v?: TextFormat) {
  // All default values will be written to the global object in case, no values were passed
  format = {
    quote: QUOTE_DELIMITER,
    delimiter: COMMA_DELIMITER,
    brk: WINDOWS_BREAK_LINE,
    hasEndCharacter: false,
    strictMode: true,
    hasHeaders: false,
    memoize: true,
    transform: true,
    empty: EMPTY_SYMBOL,
  };

  // In case some options are passed, insert the new options to
  // the object otherwise keep the previous options
  if (v) {
    if (v.empty && typeof v.empty !== "symbol") throw NotValidEmptyValue;
    format = { ...v, ...format };
  }
}
