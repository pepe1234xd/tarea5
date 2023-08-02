import { EmptyValueError, NotValidUseOfQuotes, ParseError } from "../errors.js";
import { format } from "../text-format.js";
import { context } from "./context.js";
import { Spreadsheet } from "../spreadsheet/spreadsheet.js";
import { transforms, transformsNumber } from "./transforms.js";

/**
 * Process a word to remove extra quotes to set a clean value
 * @param word The word to be processed
 */
export function process() {
  let word = "";

  // Read format options
  const { quote, delimiter, empty } = format;

  // If has no content is an empty value
  if (context.line.length === 0) return empty;

  // If the processed value is a JSON object process it
  if (context.isJSON) return JSON.parse(context.line);

  // Resets the regex to be used
  context.resetQuoteRegex();
  // The start index to be picking content
  let startIndex = 0;
  let array: RegExpExecArray | null;
  while ((array = context.quoteRegex.exec(context.line)) !== null) {
    // When a match is present check if the following characters are another quote
    const isNextQuote: boolean =
      context.line.substring(
        context.quoteRegex.lastIndex,
        context.quoteRegex.lastIndex + quote.length,
      ) === quote;
    // If the next value is a quote, simplify the double quotes and save
    // Then move the last index after the double quotes
    if (isNextQuote) {
      word += context.line.substring(startIndex, array.index) + quote;
      // Move the last index after the double quotes
      startIndex = context.quoteRegex.lastIndex + quote.length;
      context.quoteRegex.lastIndex = startIndex;
    }
    // If the next value is not a quote it is a parse error
    else throw NotValidUseOfQuotes;
  }
  // Concatenate any residual content
  if (startIndex <= context.line.length)
    word += context.line.substring(startIndex, context.line.length);

  // Finally returns the processed line as a parsed string and transform if necessary
  return context.shouldTransform ? transforms(word) : word;
}
