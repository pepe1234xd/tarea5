import {
  EmptyStringError,
  FirstCharacterInvalidError,
  isEmptySet,
  isEmptyString,
  isFirstCharacterDelimiter,
  isFirstCharacterQuote,
} from "../validations.js";
import { format } from "../text-format.js";
import { context } from "./context.js";
import { CSV } from "../csv/csv.js";
import { reducer } from "./reducer.js";

/** A stringified CSV object */
let stringified: boolean = false;
let memoized: string | null = null;

/** The current CSV data */
let csv: CSV;

/** Cleans the current memoization state */
function cleanMemoization() {
  memoized = null;
  stringified = true;
}

/**
 * This function parses a string into a CSV object
 * @param {string} string The string to be processed
 */
export async function parse(string: string) {
  /** Real string length in case that has no end character the string */
  context.slength = format.hasEndCharacter ? string.length - 1 : string.length;

  // Creates a default CSV
  csv = new CSV(string);

  // If the memoization option is on, check if the value was parsed already
  if (format.memoize) {
    // Rterun the stored data if if memoization is found
    if (memoized === string) return csv;
  }

  // Handling generic cases and ensure the string is at least 2 characters
  if (isEmptyString(string)) {
    // If strict mode is on this is considered an error
    if (format.strictMode) {
      cleanMemoization();
      throw EmptyStringError;
    } else {
      csv.isEmpty = true;
      csv.isTable = false;
      return csv;
    }
  }
  if (context.slength === 0 && isFirstCharacterQuote(string)) {
    cleanMemoization();
    throw FirstCharacterInvalidError;
  }
  if (isFirstCharacterDelimiter(string) || isEmptySet(string)) {
    csv.isEmpty = true;
    csv.isTable = false;
    return csv;
  } else {
    csv.isEmpty = false;
  }

  // Reduce all the values from the string to a valid object
  await reducer(csv);
  // Store new memoized on parsing success
  memoized = string;

  // Return a copy to avoid reference issues with the memoized version
  return csv.clone();
}
