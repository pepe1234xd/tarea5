import { expect } from "chai";
import _ from "../create-callee";
import type { TestParser, TestName } from "../types";

import { transforms } from "../../src/parser/transforms";
import { parse } from "../../src/parser/parse";
import { process } from "../../src/parser/process";
import { context, createContext } from "../../src/parser/context";
import {
  EMPTY_SYMBOL,
  setDefaultTextFormat,
  setTextFormat,
} from "../../src/text-format";
import { NotValidUseOfQuotes } from "../../src/errors";

export default function createParserTest(key: TestParser) {
  switch (key) {
    case "transforms":
      return _(key, function (item) {
        const _transforms = transforms(item.string);
        if (item.expected === "undefined" || item.expected === "UNDEFINED")
          item.expected = undefined;
        expect(_transforms).to.eql(item.expected);
      });
    case "process":
      return _(key, function (item) {
        createContext(item.word);
        context.slength = item.word.length;
        context.line = item.word;
        context.isQuoted = item.isQuoted;
        context.isJSON = item.isJSON;
        if (item.throws === "NotValidUseOfQuotes") {
          expect(function () {
            process();
          }).to.throw(NotValidUseOfQuotes);
        } else if (typeof item.expected === "string") {
          const _process = process();
          if (item.expected === "undefined" || item.expected === "UNDEFINED")
            item.expected = undefined;
          else if (item.expected === 'Symbol("empty")')
            item.expected = EMPTY_SYMBOL;
          expect(_process).to.equals(item.expected);
        } else {
          const _process = process();
          expect(_process).to.eql(item.expected);
        }
      });
    case "parse":
      return _(key, function (item) {
        // const _parse = parse(item.string);
        // expect(_parse).to.eql(item.expected);
      });
    default:
      throw new Error(`Check if a parser '${key}' test is missing`);
  }
}
