import { EmptyValueError, ParseError } from "../validations.js";
import { format } from "../text-format.js";
import { context } from "./context.js";
import { CSV } from "../csv/csv.js";
import { transforms, transformsNumber } from "./transforms.js";

/**
 * Process a word to remove extra quotes to set a clean value
 * @param word The word to be processed
 */
export function process(csv: CSV) {
  let word = context.line;

  // If the processed value is a JSON object process it
  if (context.isJSON) return JSON.parse(context.line);

  // Read format options
  const { quote, delimiter, empty } = format;

  // General cases when no characters were found
  if (word.length === 0) {
    // If has no content is an empty value
    return empty;
  }
  // General cases when a unique character was found
  else if (word.length === 1) {
    // If the value found was a quote symbol, is a parse error
    if (word === quote) throw ParseError(csv);
    // If the value found was a delimiter is an empty value
    else if (word === delimiter) return empty;
    else return context.shouldTransform ? transformsNumber(word) : word;
  }
  // General cases when two characters were found
  else if (word.length === 2) {
    // Cases when the word was inside quotes
    if (context.isQuoted) {
      // If the character are two quotes return an empty value
      if (word[0] === quote && word[1] === quote) return empty;
      // If the characters are a mix of quotes and delimiters is a parse error
      else if (
        word[0] === quote ||
        word[0] === delimiter ||
        word[1] === quote ||
        word[1] === delimiter
      )
        throw ParseError(csv);
      // Any other way is a valid word
      else return context.shouldTransform ? transformsNumber(word) : word;
    }
    // Cases when the word was not surrounded by quotes
    else {
      // If the first value is a quote it can only be followed by a quote,
      // and that would mean a "double quote" was found thus
      // reducing it as a single quote
      if (word[0] === quote) {
        if (word[1] === quote) return quote;
        else throw ParseError(csv);
      }
      // If the first value is not a quote it can only be followed by a non quote symbols
      else {
        if (word[1] === quote) throw ParseError(csv);
        else return context.shouldTransform ? transformsNumber(word) : word;
      }
    }
  }
  // In case of three characters and that it is surrounded by quotes
  // any non quote symbol inside it is a valid value and will be returned as it is
  else if (word.length === 3 && context.isQuoted) {
    if (
      word[0] === quote &&
      word[1] !== quote &&
      word[1] !== delimiter &&
      word[2] === quote
    )
      return context.shouldTransform ? transformsNumber(word[1]) : word[1];
    else throw ParseError(csv);
  }

  // For any other cases as we are in quote mode remove outside quotes
  if (context.isQuoted) word = word.substring(1, word.length - 1);

  // Fort strings longer thatn 3 characters applies below loop logic
  let _line: string = "";
  let next: string | undefined;
  for (let i = 0; i < word.length; i++) {
    // Saving the next character from the word in the iteration current position
    // and if there is no next character save an undefined value
    next = i === word.length - 1 ? undefined : word[i + 1];
    /** Stores the current character from the iteration */
    const char = word[i];
    // If the current char is the quote symbol, it can only be followed by
    // a quote symbol to be simplified as a single quote symbol
    if (char === quote) {
      if (next !== quote) throw ParseError(csv);
      else {
        _line = quote;
        // Will make it skip the following character as it is the next quote
        i++;
        continue;
      }
    }
    // Any other symbol is a valid symbol and will be stored directly to the line
    else _line += char;
  }

  // Finally returns the processed line as a parsed string and transform if necessary
  return context.shouldTransform ? transforms(_line) : _line;
}
