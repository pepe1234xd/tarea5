import { format } from "./text-format.js";
import { context } from "./parser/context.js";
import { CSV } from "./csv/csv.js";
import type { ParseContext } from "./types.js";

// Errors to throw on validation failed
export const FirstCharacterInvalidError = new Error(
  "Text began with an invalid character",
);
export const EmptyStringError = new Error("Trying to parse empty string");
export const EmptyValueError = new Error(
  `Empty value is being passed, check after position ${context.errorIndex + 1}`,
);
export const ObjectNeverClosedError = new Error(
  `The object was never closed, it was opened since position ${
    context.slength - context.line.length
  }`,
);
export const IsNotTableFormatError = new Error(
  "The CSV object is not in table format",
);
export const NotValidOptionError = new Error("The passed option was not valid");
export const NotValidHeaderError = new Error(
  "Header cannot be a JavaScript value",
);
export const NotValidEmptyValue = new Error(
  "The empty symbol must be a special JavaScript symbol",
);

// Validations for the parsing or the serialization from an object

/**
 * Checks if the string is not empty
 * @param slength
 * @example const string = "";
 */
export const isEmptyString = (string: string) => string.length < 1;
/**
 * Checks if the set starts with a the quote character
 * @example string = '"';
 */
export const isFirstCharacterQuote = (string: string) =>
  string[0] === format.quote;
/**
 * Checks if the set starts with a valid character
 * @example string = "'";
 */
export const isFirstCharacterDelimiter = (string: string) =>
  string[0] === format.delimiter;
/**
 * Checks if the set is valid but empty
 * @example string = "'";
 */
export const isEmptySet = (string: string) =>
  (string = format.delimiter + format.delimiter);

/**
 * Creates a parse error object
 */
export const ParseError = (instance: CSV) => {
  const { errorIndex, slength, startIndex } = context;
  const { brk } = format;
  let string = instance.string.replace(/\n/g, "\\n").replace(/\r/g, "\\r");

  const breakLineMessage =
    brk === "\r\n"
      ? "\n\nDon't forget to check if the line breaker of your system is different than \\r\\n\n"
      : "";

  const MIN_LENGTH = 25;
  const message_invalid = `Invalid string from position ${startIndex} to position ${errorIndex}`;
  const top = "-----------  CSV FILE  --------------";
  const floor = "_____________________________________";

  if (slength < MIN_LENGTH) {
    let spaces = "";
    for (let index = 0; index <= errorIndex; index++) {
      spaces += " ";
    }
    const endOfLine =
      errorIndex === slength - 1 ? "\u22A0\n\n(End of line reached)" : "";
    const here = `${spaces}error here`;
    const arrow = `${spaces}↓`;
    const message_string = string + endOfLine;
    return Error(
      `${message_invalid}\n${top}\n${here}\n${arrow}\n${message_string}\n${floor}${breakLineMessage}`,
    );
  } else {
    const isIndexSmall = errorIndex < MIN_LENGTH;
    let startDots = isIndexSmall ? "" : "...";
    const endOfLine =
      errorIndex === slength - 1 ? "\u22A0\n\n(End of line reached)" : "...";
    let spaces = "";
    for (let i = startIndex; i <= errorIndex - (isIndexSmall ? 0 : 3); i++) {
      spaces += " ";
    }
    const isSmallDifference = errorIndex - startIndex < 20;
    const fromHere = isSmallDifference ? "" : "from here";

    let toHere = "";
    if (isSmallDifference) {
      toHere = "error here";
    } else {
      toHere = "to here";
      spaces = spaces.substring(toHere.length, spaces.length - 1);
    }

    const firstArrow = isSmallDifference ? "" : "↓";
    const here = `${isIndexSmall ? "" : "   "}${fromHere}${spaces}${toHere}`;
    const arrow = `${isIndexSmall ? "" : "   "}${firstArrow}${spaces}↓`;
    const message_string = `${startDots}${string.substring(
      startIndex + 1,
      errorIndex,
    )}${endOfLine}`;
    return Error(
      `${message_invalid}\n${top}\n${here}\n${arrow}\n${message_string}\n${floor}${breakLineMessage}`,
    );
  }
};
