import { replacer, Matcher } from "dynason";
import { WINDOWS_BREAK_LINE, format } from "./text-format.js";
import { context } from "./parser/context.js";
import { CSV } from "./csv/csv.js";

// Errors to throw on validation failed
export const FirstCharacterInvalidError = new Error(
  "Text began with an invalid character",
);
export const EmptyStringError = new Error("Trying to parse empty string");
export const EmptyValueError = function () {
  return new Error(
    `Empty value is being passed, check after position ${
      context.errorIndex + 1
    }`,
  );
};
export const ObjectNeverClosedError = function () {
  return new Error(
    `The object was never closed, it was opened since position ${
      context.slength - context.line.length
    }`,
  );
};
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

export const NotValidUseOfQuotes = new Error(
  `To avoid compatiblity issues, quotes as a character can only be used within a quoted line and must be input twice to escape it (This only apply if is not a JSON Object or Array).
  - "a""b""c" ✓ (Valid)
  - "a"b"c"   ⛌ (Invalid)
  - a""b""c   ⛌ (Invalid)`,
);

export const NotValidBase26String = new Error(
  'Only letters from "a" to "z" can be used to match a column',
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
 * Parse error template string
 */
const PARSE_ERROR_TEMPLATE_STRING = `
Invalid string from position <start-index/> to position <error-index/>
-----------  CSV FILE  --------------
<here/>
<arrow/>
<pre/><string/><end-of-line/>
_____________________________________
<break-line-message/>
`;

/**
 * Creates a parse error object
 */
export const ParseError = (instance: CSV) => {
  const { errorIndex, slength, startIndex } = context;
  const { brk } = format;

  const TRIPLE_DOTS = "...";
  const TRIPLE_SPACES = "   ";

  // Spaces to add for arrows representations
  let spaces = "";

  // Replacer for the text file
  const matcher: Matcher = {
    startIndex: startIndex.toString(),
    errorIndex: errorIndex.toString(),
    arrow: "",
    here: "",
    endOfLine: " (End of line)",
    breakLineMessage: "",
    pre: "",
    string: "",
  };

  // Replace real breaking spaces with their string representation
  let string = instance.string.replace(/\n/g, "\\n").replace(/\r/g, "\\r");

  // Adding breakline message in case is not using the windows default break line
  if (brk === WINDOWS_BREAK_LINE)
    matcher.breakLineMessage =
      "\n\nDon't forget to check if the line breaker of your system is different than \\r\\n\n";

  // Tentative error message should not be longer thatn 25 characters
  const MIN_LENGTH = 25;

  // In case the string that caused the error is very small a end of line message will be displayed
  if (slength < MIN_LENGTH) {
    // Are the spaces to move the text arrow to reach the real character that caused the issue
    for (let index = 0; index <= errorIndex; index++) spaces += " ";
    // Sets the arrow to show the character that caused the error
    matcher.here = spaces + "error here";
    matcher.arrow = spaces + "↓";
    // In case the error is far from the end of line of the string remove it
    if (!(slength - 1)) matcher.endOfLine = "";
    // Adds the string that caused the error
    matcher.string = string;
  }
  // When the string that caused the error is beyond the max characters
  // length another message will be displayed to fit in the screen
  else {
    // Checks if the error was caused before the maximum length
    // for the message to be displayed
    const isIndexSmall = errorIndex < MIN_LENGTH;
    // In the same way if there is lots of characters after the character
    // that caused the error, the end of line error will be replaced with dots
    if (errorIndex !== slength - 1) matcher.endOfLine = TRIPLE_DOTS;
    // Checks if the space between the error and the start of the string is long
    // enough to write a "from-to" message
    const MINIMUM_FROM_TO_STRING_LENGTH = 20;
    const isSmallDifference =
      errorIndex - startIndex < MINIMUM_FROM_TO_STRING_LENGTH;
    // If the index is too big add a tab before the messages
    let tab = isIndexSmall ? "" : TRIPLE_SPACES;
    // Creates the simple arrow message if the error is close
    if (isSmallDifference) {
      // Will create the spaces for the arrow relative to the index where the error was caused
      for (let i = startIndex; i <= errorIndex - (isIndexSmall ? 0 : 3); i++)
        spaces += " ";
      matcher.here = tab + spaces + "error here";
    }
    // Creates a from-to message if the string that caused the error
    // is too long
    else {
      // Removes whitespaces with the offset that causes the "to here" message
      spaces = spaces.substring(7, spaces.length - 1);
      matcher.here = tab + "from here" + spaces + "to here";
      matcher.arrow = tab + "↓" + spaces + "↓";
    }
    // If there is much more characers before the character that caused
    // the error, some dots will be added to symbolize that
    if (isIndexSmall) matcher.pre = TRIPLE_DOTS;
    // Cuts the part of the string that contains the error
    matcher.string = string.substring(startIndex + 1, errorIndex);
  }

  // Finally returns the generated error message
  return Error(replacer(PARSE_ERROR_TEMPLATE_STRING, matcher, { mode: "xml" }));
};
