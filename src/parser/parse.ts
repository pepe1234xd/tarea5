import {
  EmptyStringError,
  FirstCharacterInvalidError,
  isEmptyString,
  isFirstCharacterQuote,
} from "../errors.js";
import { format } from "../text-format.js";
import { createContext } from "./context.js";
import { Spreadsheet } from "../spreadsheet/spreadsheet.js";
import { reducer } from "./reducer.js";
import { ValueObject } from "../types.js";

/** A stringified CSV object */
let stringified: boolean = false;
let memoized: string | null = null;

/** The current CSV data */
let _csv: Spreadsheet<any>;

/** Cleans the current memoization state */
function cleanMemoization() {
  memoized = null;
  stringified = true;
}

/**
 * This function parses a string into a CSV object
 * @param {string} string The string to be processed
 */
export function parse<V extends ValueObject>(string: string) {
  // Creates a new parse context
  createContext(string);

  // If the memoization option is on, check if the value was parsed already
  if (format.memoize) {
    // Rterun the stored data if if memoization is found
    if (memoized === string) return _csv;
  }

  // If strict mode is on and there is no content throw an error
  if (isEmptyString(string)) {
    if (format.strictMode) {
      cleanMemoization();
      throw EmptyStringError;
    } else {
      return new Spreadsheet<any>([[format.empty]], true, [], false, {
        quote: format.quote,
        delimiter: format.delimiter,
        brk: format.brk,
      });
    }
  }
  // If the content is just the character quote return an error
  else if (isFirstCharacterQuote(string)) {
    cleanMemoization();
    throw FirstCharacterInvalidError;
  }

  // Reduce all the values from the string to a valid object
  const { data, headers, isTable } = reducer();
  // Store new memoized on parsing success
  memoized = string;

  // Creates a default CSV
  const csv = new Spreadsheet<V>(data, isTable, headers, format.hasHeaders, {
    quote: format.quote,
    delimiter: format.delimiter,
    brk: format.brk,
  });
  _csv = csv;

  // Return a copy to avoid reference issues with the memoized version
  return csv.clone();
}
