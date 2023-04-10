import {
  EmptyValueError,
  NotValidHeaderError,
  ObjectNeverClosedError,
  ParseError,
} from "../validations.js";
import { format } from "../text-format.js";
import type { Coordinates, ParseContext } from "../types.js";
import { context } from "./context.js";
import { CSV } from "../csv/csv.js";
import { process } from "./process.js";

/**
 * If the content has more than 2 rows
 * or the set contains headers, if the columns number keeps the same
 * will be a table */
function validateTableFormat(csv: CSV) {
  if (csv.hasHeaders && context.pointer.y > 0) {
    csv.isTable =
      csv.headers.length === csv.data[context.pointer.y].length && csv.isTable;
  } else if (context.pointer.y > 1) {
    csv.isTable =
      csv.data[context.pointer.y - 1].length ===
        csv.data[context.pointer.y].length && csv.isTable;
  }
}

/**
 * Reduces the string from the CSV object to JavaScript values
 * @param csv The CSV object to populate
 */
export async function reducer(csv: CSV) {
  const { quote, delimiter, brk, strictMode, hasHeaders, transform } = format;

  // CSV will be marked as table until proven wrong
  csv.isTable = true;

  /** This line will represent a found enclosed text */
  let line = "";
  /** Global index from the iteration process */
  let index = 0;
  /** Flag to use to determine if some content is surrounded by quotes */
  let isEven = true;
  /** Flag to use to determine if what is processed is a header or a simple row */
  let isHeader = hasHeaders;

  // Reset the previous context if used
  context.reset();

  // Iterates throu each character of the string
  for (index = 0; index < context.slength; index++) {
    // Store as the possible error index the current one
    context.errorIndex = index;
    // Stores the global index from the whole string in the parsing process
    context.index = index;

    /** The current char */
    const char: string = csv.string[index];
    // Add to the line the current character
    line += char;
    /** Flag to check if the line starts with the quote symbol */
    const startsWithQuote: boolean = line[0] === quote;
    /** Flag to check if the next character is the delimiter symbol */
    const isNextDelimiter: boolean =
      csv.string.substring(index + 1, index + delimiter.length + 1) ===
      delimiter;
    /** Flag to check if the next character is the line breaker symbol */
    const isNextBreaker: boolean =
      csv.string.substring(index + 1, index + brk.length + 1) === brk;
    /** Flag to check if the next characters are the line breaker and delimiter symbol */
    const isNextDelimiterAndBreaker: boolean =
      csv.string.substring(
        index + 1,
        index + delimiter.length + brk.length + 1,
      ) ===
      delimiter + brk;
    /** Flag to check if the next character is the end of line */
    const isNextEndOfLine: boolean = !csv.string.substring(
      index + 1,
      index + 2,
    );

    // Every time a quote is hit, will change the state from the isEven flag
    if (char === quote) isEven = !isEven;

    // When a delimiter is found and the hit count is "even"
    // it means that an enclosed text by delimiters was found
    if ((isNextDelimiter || isNextBreaker) && isEven) {
      // If the strict mode is on and there is no quote at the beggining of the line
      // will use a copied trimmed line, if not will use the current one
      context.line = !startsWithQuote && strictMode ? line.trim() : line;
      // If there is no content in the line, start again the process
      if (!context.line) continue;
      // Set the start index for the error function if needed
      context.startIndex = index - line.length;
      // Marks the found line as quoted if is surrounded by them
      // and starts with one of them
      context.isQuoted = startsWithQuote && isEven;
      // Stores the processed value to assigned place
      const word = process(csv);

      // As a line was finally saved, reset the values and restart the
      // process to the next found delimiter if any
      line = "";
      // If was a header it means that the pointer will stay as zero position
      // and will start to be moved until the next session
      if (isHeader) {
        // A must be a string and not a JavaScript value
        if (typeof word !== "string") throw NotValidHeaderError;
        csv.headers.push(word);
        isHeader = false;
      } else {
        // For delimiter plus line breaks or just breaks,
        // move to the beggining of the next row
        if (isNextBreaker || isNextDelimiterAndBreaker) {
          // Validate if the object is still a table, before adding a new row
          validateTableFormat(csv);
          // Moves the global index after the delimiter or the breakline to skip it
          index = isNextBreaker
            ? index + brk.length
            : index + delimiter.length + brk.length;
          // Sets the new pointer to store values
          context.pointer = {
            x: 0,
            y: context.pointer.y + 1,
          };
          // Create a new "row" for the selected array
          csv.data[context.pointer.y] = [];
        }
        // When just a delimiter is found, just go to the next column
        else {
          // Moves the global index after the delimiter to skip it
          index = index + delimiter.length;
          // Sets the new pointer to store values
          context.pointer = {
            x: context.pointer.x + 1,
            y: context.pointer.y,
          };
        }
        // Store the value in the assigned position,
        csv.data[context.pointer.y][context.pointer.x] = word;
      }
      // Resets the line value for the next iteration
      context.line = line;
      // Case when is the end of line
    } else if (isNextEndOfLine) {
      // If is on strinct mode and a quote was never closed
      // will be taken as a parse error
      if (!isEven && startsWithQuote && strictMode)
        throw ObjectNeverClosedError;
      // Sets the new pointer to store values
      context.pointer = {
        x: context.pointer.x + 1,
        y: context.pointer.y,
      };
      // Stores a trimmed version from the line
      const trimmed = line.trim();
      // If the strict mode is on and there is no quote at the beggining of the line
      // will use a copied trimmed line, if not will use the current one
      context.line = !startsWithQuote && strictMode ? trimmed : line;
      context.startIndex = index - line.length;
      // Marks if a line should be transformed
      context.shouldTransform = strictMode && transform && context.isQuoted;
      // Marks the line as posible javascript objects if needed
      context.isJSON =
        strictMode &&
        transform &&
        ((trimmed[0] === "{" && trimmed[trimmed.length - 1] === "}") ||
          (trimmed[0] === "[" && trimmed[trimmed.length - 1] === "]"));
      // Stores the processed value
      const word = process(csv);
      // Create a new "row" for the selected array if does not exists
      if (!csv.data[context.pointer.y]) csv.data[context.pointer.y] = [];
      // Store the value in the assigned position
      csv.data[context.pointer.y][context.pointer.x] = word;
      // Do a final validation before closing the object
      validateTableFormat(csv);
    }
  }
}
