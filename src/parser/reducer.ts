import { NotValidHeaderError, ObjectNeverClosedError } from "../errors.js";
import { format } from "../text-format.js";
import type { ValueData, ValueEmpty } from "../types.js";
import { context } from "./context.js";
import { Spreadsheet } from "../spreadsheet/spreadsheet.js";
import { process } from "./process.js";

/**
 * A csv object can be considered as a table as always has the
 * following characteristics:
 * - The set contains valid headers
 * - The content has more than 2 rows
 * - The columns number across all rows is always the same
 */
// function validateTableFormat(csv: CSV) {
//   if (csv.hasHeaders && context.pointer.y > 0) {
//     csv.isTable =
//       csv.headers.length === csv.data[context.pointer.y].length && csv.isTable;
//   } else if (context.pointer.y > 1) {
//     csv.isTable =
//       csv.data[context.pointer.y - 1].length ===
//         csv.data[context.pointer.y].length && csv.isTable;
//   }
// }

/**
 * Reduces the string from the CSV object to JavaScript values
 * @param csv The CSV object to populate
 */
export function reducer() {
  const {
    quote,
    delimiter,
    brk,
    strictMode,
    hasHeaders,
    transform,
    ignoreEmptyLines,
  } = format;

  /** This line will represent a found enclosed text */
  let line = "";
  /** Global index from the iteration process */
  let index = 0;
  /** Flag to use to determine if some content is surrounded by quotes */
  let isEven = true;
  /** Flag to use to determine if what is processed is a header or a simple row */
  let isHeader = hasHeaders;
  /** The parsed data */
  let data: ValueData<any> = [[]];
  /** The headers of the data */
  let headers: string[] = [];

  // Iterates throu each character of the string
  for (index = 0; index < context.slength; index++) {
    // Store as the possible error index the current one
    context.errorIndex = index;
    // Stores the global index from the whole string in the parsing process
    context.index = index;

    /** The current char */
    const char: string = context.string[index];
    // Add to the line the current character
    line += char;
    // For cases where there is a single char and this is a delimiter or a breaker
    // it can be assumed that there is "Nothing" before it
    // so there is an empty value to store
    // If that the case: empties the line content and continues
    if (line === brk) {
      // Creates and moves to the new row beggining (only if is not set to be ignored)
      if (!ignoreEmptyLines) {
        data[context.pointer.y].push(format.empty);
        data.push([]);
        context.pointer.skip();
      }
      line = "";
      continue;
    } else if (line === delimiter) {
      // Moves to the next column
      context.pointer.right();
      data[context.pointer.y].push(format.empty);
      line = "";
      continue;
    }
    /** Flag to check if the next character is the delimiter symbol */
    const isNextDelimiter: boolean =
      context.string.substring(index + 1, index + delimiter.length + 1) ===
      delimiter;
    /** Flag to check if the next character is the line breaker symbol */
    const isNextBreaker: boolean =
      context.string.substring(index + 1, index + brk.length + 1) === brk;
    /** Flag to check if the next characters are the line breaker and delimiter symbol */
    const isNextDelimiterAndBreaker: boolean =
      context.string.substring(
        index + 1,
        index + delimiter.length + brk.length + 1,
      ) ===
      delimiter + brk;
    /** Flag to check if the next character is the end of line */
    const isNextEndOfLine: boolean = !context.string.substring(
      index + 1,
      index + 2,
    );

    // Every time a quote is hit, will change the state from the isEven flag
    if (char === quote) isEven = !isEven;

    // When some kind of end is found start to check if it is an object
    if (isNextDelimiter || isNextBreaker || isNextEndOfLine) {
      // Set the start index for the error function if needed
      context.startIndex = index - line.length;
      // Stores a trimmed version from the line
      const trimmed = line.trim();
      // Stores the line to be used
      context.line = strictMode ? trimmed : line;
      /** Flag to check if the line may be a JSON Object */
      const isObject =
        strictMode &&
        ((trimmed[0] === "{" && trimmed[trimmed.length - 1] === "}") ||
          (trimmed[0] === "[" && trimmed[trimmed.length - 1] === "]"));
      // If is an object process the word
      if (isObject) {
        context.isQuoted = false;
        context.isJSON = true;
      } else {
        // If the line is not an object and the quotes are not even, continue
        // collecting characters
        if (!isEven) continue;
        /** Flag to check if the line starts with the quote symbol */
        const startsWithQuote: boolean =
          context.line.substring(0, quote.length) === quote;
        // If the passed value is quoted will be removed
        if (startsWithQuote) {
          // Marks the content as quoted
          context.isQuoted = true;
          // Removes the surrounding quptes
          context.line = context.line.substring(
            context.line.length - quote.length,
            quote.length,
          );
        }
      }
      // Marks if a line should be transformed, only if it is in
      // strict mode and is not quoted
      context.shouldTransform = strictMode && transform && !context.isQuoted;
      // Stores the processed value to assigned place
      const word = process();
      // As a line was finally saved, reset the values and restart the
      // process to the next found delimiter if any
      line = "";
      // If was a header it means that the pointer will stay as zero position
      // and will start to be moved until the next session
      if (isHeader) {
        // A header must be a string and not a JavaScript value
        if (typeof word !== "string") throw NotValidHeaderError;
        headers.push(word);
        // If a breaker or the end of the line was hit, it means that
        // all of the headers were parsed
        isHeader = isHeader && !(isNextBreaker || isNextEndOfLine);
      } else {
        // For delimiter plus line breaks push "word + empty",
        // then move to the beggining of the next row
        if (isNextDelimiterAndBreaker) {
          // Moves the global index after the delimiter and the breakline to skip them
          index += delimiter.length + brk.length;
          // Points to the next column in the current row and store the processed value
          context.pointer.right();
          data[context.pointer.y].push(word);
          // Points to the next column again in the current row and adds an empty
          // value as a "Nothing" is between the breakline and the delimiter
          context.pointer.right();
          data[context.pointer.y].push(format.empty);
          // Create a new "row" as there is a breaker and move the pointer
          // to the start of this
          data.push([]);
          context.pointer.skip();
        }
        // For line breaks move to the beggining of the next row
        else if (isNextBreaker) {
          // Moves the global index after the breakline to skip it
          index += brk.length;
          // Stores the value in there then creates a new "row" for the selected array
          // then points to the start of the new row
          data[context.pointer.y].push(word);
          // Points to the next column in the current row then to the next row
          context.pointer.right();
          context.pointer.skip();
          data.push([]);
        }
        // If is the end of the line just adds the last value and stop the iteration
        else if (isNextEndOfLine) {
          // Makes to go to the end in the iteration
          index = context.slength;
          // Adds the last value
          data[context.pointer.y].push(word);
          // Points to the next column in the current row
          context.pointer.right();
        }
        // When just a delimiter is found, just go to the next column
        else {
          // Moves the global index after the delimiter to skip it
          index += delimiter.length;
          // Store the value in the assigned position,
          data[context.pointer.y].push(word);
          // Points to the next column in the current row
          context.pointer.right();
        }
      }
    }
  }

  // If there is remaining content and was never closed throw an error
  if (!isEven && line) throw ObjectNeverClosedError();

  // Force a last skip to end reading the content
  context.pointer.skip();
  // If x was stable during all the skips it means it is a table like object
  const isTable = context.pointer.isStableX;

  // Reset the previous context if used
  context.reset();

  return {
    data,
    headers,
    isTable,
  };
}
