import { expect } from "chai";
import _ from "../create-callee";
import type { TestParser } from "../types";

import { transforms } from "../../src/parser/transforms";
import { parse } from "../../src/parser/parse";
import { process } from "../../src/parser/process";
import { context, createContext } from "../../src/parser/context";

export default function createParserTest(key: TestParser) {
  switch (key) {
    case "transforms":
      return _(key, function (item) {
        const _transforms = transforms(item.string);
        expect(_transforms).to.eql(item.expected);
      });
    case "process":
      return _(
        key,
        function (item) {
          createContext(item.word);
          context.line = item.word;
          context.isQuoted = item.isQuoted;
          context.isJSON = item.isJSON;
          const _process = process();
          expect(_process).to.eql(item.expected);
        },
        function (
          word: string,
          _context: { isJSON: boolean; isQuoted: boolean },
        ) {
          createContext(word);
          context.line = word;
          context.isQuoted = _context.isQuoted;
          context.isJSON = _context.isJSON;
          process();
        },
      );
    case "parse":
      return _(
        key,
        function (item) {
          const _parse = parse(item.string);
          expect(_parse.string).to.equals(item.expected.string);
          expect(_parse.isTable).to.equals(item.expected.isTable);
          expect(_parse.hasHeaders).to.equals(item.expected.hasHeaders);
          expect(_parse.headers).to.eql(item.expected.headers);
          expect(_parse.toArray()).to.eql(item.expected.data);
          if (item.expected.isTable)
            expect(_parse.size).to.eql(item.expected.size);
        },
        parse,
      );
    default:
      throw new Error(`Check if a parser '${key}' test is missing`);
  }
}
